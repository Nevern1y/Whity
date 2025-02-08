import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        courseProgress: true,
        userAchievements: true,
        sentFriendships: true,
        receivedFriendships: true,
        courseRatings: true,
        statistics: true,
        studySessions: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const totalStudyTime = user.studySessions.reduce((acc, session) => {
      return acc + (session.duration || 0)
    }, 0)

    const completedCourses = user.courseProgress.filter(p => p.completedAt).length
    const totalFriends = user.sentFriendships.length + user.receivedFriendships.length
    const averageRating = user.courseRatings.length > 0
      ? (user.courseRatings.reduce((acc, curr) => acc + curr.rating, 0) / user.courseRatings.length).toFixed(1)
      : "0.0"

    const totalProgress = user.courseProgress.length > 0
      ? user.courseProgress.reduce((acc, curr) => acc + curr.progress, 0) / user.courseProgress.length
      : 0

    return NextResponse.json({
      totalStudyTime,
      completedCourses,
      totalFriends,
      achievements: user.userAchievements.length,
      currentStreak: user.statistics?.currentStreak || 0,
      totalTimeSpent: user.statistics?.totalTimeSpent || 0,
      averageRating,
      totalProgress,
      learningGoals: {
        daily: 30,
        progress: user.statistics?.totalTimeSpent || 0
      },
      certificatesEarned: completedCourses,
      recentActivity: user.studySessions.map(session => ({
        id: session.id,
        type: 'study',
        duration: session.duration,
        createdAt: session.createdAt
      }))
    })
  } catch (error) {
    console.error("Dashboard stats error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 