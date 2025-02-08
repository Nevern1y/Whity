import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { CourseProgress, CourseRating, UserAchievement, Friendship, Activity } from "@prisma/client"

interface ActivityWithId extends Activity {
  id: string
  type: string
  description: string
  createdAt: Date
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const userId = params.id

    // Get user stats from database
    const [
      courseProgress,
      courseRatings,
      userAchievements,
      sentFriendships,
      receivedFriendships,
      recentActivity
    ] = await Promise.all([
      prisma.courseProgress.findMany({
        where: { userId },
        include: { course: true }
      }),
      prisma.courseRating.findMany({
        where: { userId }
      }),
      prisma.userAchievement.findMany({
        where: { userId },
        include: { achievement: true }
      }),
      prisma.friendship.findMany({
        where: { senderId: userId },
        include: { receiver: true }
      }),
      prisma.friendship.findMany({
        where: { receiverId: userId },
        include: { sender: true }
      }),
      prisma.activity.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 10
      })
    ]) as [
      CourseProgress[],
      CourseRating[],
      UserAchievement[],
      Friendship[],
      Friendship[],
      ActivityWithId[]
    ]

    // Calculate stats
    const completedCourses = courseProgress.filter((p: CourseProgress) => p.completedAt).length
    const totalFriends = sentFriendships.length + receivedFriendships.length
    const averageRating = courseRatings.length > 0
      ? courseRatings.reduce((acc: number, curr: CourseRating) => acc + curr.rating, 0) / courseRatings.length
      : 0
    const achievements = userAchievements.length

    // Format recent activity
    const formattedActivity = recentActivity.map((activity: ActivityWithId) => ({
      id: activity.id,
      type: activity.type,
      description: activity.description,
      date: activity.createdAt
    }))

    return NextResponse.json({
      totalStudyTime: courseProgress.reduce((acc: number, curr: CourseProgress) => acc + (curr.totalTimeSpent || 0), 0),
      completedCourses,
      achievements,
      averageRating,
      totalFriends,
      recentActivity: formattedActivity
    })
  } catch (error) {
    console.error("[USER_STATS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 