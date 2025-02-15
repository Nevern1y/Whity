import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import type { Activity, Prisma } from "@prisma/client"

interface ArticleStats {
  total: number
  published: number
  draft: number
  views: number
}

interface ActivityWithMetadata {
  id: string
  type: string
  description: string
  createdAt: Date
  metadata: Prisma.JsonValue
}

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id || !["ADMIN", "MANAGER"].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Get user stats
    const [
      totalUsers,
      activeUsers,
      newUsers,
      totalCourses,
      publishedCourses,
      totalArticles,
      publishedArticles,
      articlesViews,
      recentActivities
    ] = await Promise.all([
      // Total users
      prisma.user.count(),
      // Active users (logged in last 24h)
      prisma.user.count({
        where: {
          lastActive: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        }
      }),
      // New users today
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      // Total courses
      prisma.course.count(),
      // Published courses
      prisma.course.count({
        where: { published: true }
      }),
      // Total articles
      (prisma as any).article.count(),
      // Published articles
      (prisma as any).article.count({
        where: { published: true }
      }),
      // Total article views
      (prisma as any).article.aggregate({
        _sum: {
          views: true
        }
      }),
      // Recent activities
      prisma.activity.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          type: true,
          description: true,
          createdAt: true,
          metadata: true
        }
      })
    ])

    // Calculate growth (percentage of new users in last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const usersThirtyDaysAgo = await prisma.user.count({
      where: {
        createdAt: {
          lte: thirtyDaysAgo
        }
      }
    })
    const growth = usersThirtyDaysAgo > 0 
      ? ((totalUsers - usersThirtyDaysAgo) / usersThirtyDaysAgo) * 100
      : 0

    // Calculate article statistics
    const articleStats: ArticleStats = {
      total: totalArticles,
      published: publishedArticles,
      draft: totalArticles - publishedArticles,
      views: articlesViews._sum.views || 0
    }

    return NextResponse.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        newToday: newUsers,
        growth
      },
      courses: {
        total: totalCourses,
        published: publishedCourses,
        inProgress: totalCourses - publishedCourses,
        averageRating: 4.5 // TODO: Calculate from course ratings
      },
      articles: articleStats,
      activities: recentActivities.map((activity: ActivityWithMetadata) => ({
        ...activity,
        timestamp: activity.createdAt
      }))
    })
  } catch (error) {
    console.error("[ADMIN_STATS]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 