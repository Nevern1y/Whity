import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

type UserWithIncludes = {
  courseProgress: { completedAt: Date | null; progress: number }[]
  userAchievements: any[]
  sentFriendships: any[]
  receivedFriendships: any[]
  courseRatings: { rating: number }[]
  statistics: { currentStreak: number; totalTimeSpent: number } | null
  studySessions: { duration: number }[]
}

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
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
        studySessions: true
      }
    }) as (UserWithIncludes & { name: string | null; email: string | null; image: string | null }) | null

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    const totalStudyTime = user.studySessions.reduce((acc: number, session) => {
      return acc + (session.duration || 0)
    }, 0)

    const completedCourses = user.courseProgress.filter(p => p.completedAt).length
    const totalFriends = user.sentFriendships.length + user.receivedFriendships.length
    const averageRating = user.courseRatings.length > 0
      ? (user.courseRatings.reduce((acc: number, curr) => acc + curr.rating, 0) / user.courseRatings.length).toFixed(1)
      : "0.0"

    const totalProgress = user.courseProgress.length > 0
      ? user.courseProgress.reduce((acc: number, curr) => acc + curr.progress, 0) / user.courseProgress.length
      : 0

    return NextResponse.json({
      user: {
        name: user.name,
        email: user.email,
        image: user.image
      },
      stats: {
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
        certificatesEarned: completedCourses
      }
    })
  } catch (error) {
    return NextResponse.json({ message: "Internal Error" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const data = await request.json()
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data,
      select: {
        name: true,
        image: true
      }
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error updating profile:", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 