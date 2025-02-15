import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Get user statistics in parallel
    const [
      coursesCompleted,
      achievements,
      friends,
      unreadNotifications
    ] = await Promise.all([
      // Count completed courses
      prisma.courseProgress.count({
        where: {
          userId: session.user.id,
          OR: [
            { progress: 100 },
            { completedAt: { not: null } }
          ]
        }
      }),

      // Count achievements
      prisma.userAchievement.count({
        where: {
          userId: session.user.id
        }
      }),

      // Count friends (accepted friendships)
      prisma.friendship.count({
        where: {
          OR: [
            { senderId: session.user.id },
            { receiverId: session.user.id }
          ],
          status: 'ACCEPTED'
        }
      }),

      // Count unread notifications
      prisma.notification.count({
        where: {
          userId: session.user.id,
          read: false
        }
      })
    ])

    return NextResponse.json({
      coursesCompleted,
      achievements,
      friends,
      unreadNotifications
    })
  } catch (error) {
    console.error("[USER_STATS]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 