import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

interface StudyMetadata {
  duration: number
}

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
        achievements: true,
        sentFriendships: true,
        receivedFriendships: true,
        courseRatings: true,
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const completedCourses = user.courseProgress.filter(p => p.completedAt).length
    const totalFriends = user.sentFriendships.filter(f => f.status === 'ACCEPTED').length + 
                        user.receivedFriendships.filter(f => f.status === 'ACCEPTED').length
    
    const averageRating = user.courseRatings.length > 0
      ? (user.courseRatings.reduce((acc, curr) => acc + curr.rating, 0) / user.courseRatings.length).toFixed(1)
      : "0.0"

    const totalProgress = user.courseProgress.length > 0
      ? user.courseProgress.reduce((acc, curr) => acc + curr.progress, 0) / user.courseProgress.length
      : 0

    // Calculate total study time from activities
    const studyActivities = user.activities.filter(a => a.type === 'STUDY')
    const totalStudyTime = studyActivities.reduce((acc, activity) => {
      const metadata = activity.metadata as StudyMetadata | null
      return acc + (metadata?.duration || 0)
    }, 0)

    return NextResponse.json({
      totalStudyTime,
      completedCourses,
      totalFriends,
      achievements: user.achievements.length,
      currentStreak: 0, // This should be calculated based on continuous daily activity
      totalTimeSpent: totalStudyTime,
      averageRating,
      totalProgress,
      learningGoals: {
        daily: 30,
        progress: totalStudyTime
      },
      certificatesEarned: completedCourses,
      recentActivity: user.activities.map(activity => ({
        id: activity.id,
        type: activity.type,
        description: activity.description,
        metadata: activity.metadata,
        createdAt: activity.createdAt
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