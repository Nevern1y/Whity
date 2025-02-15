import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { emitDashboardUpdate } from "@/lib/socket-server"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { courseId, duration } = body

    // Create study session
    const studySession = await prisma.studySession.create({
      data: {
        userId: session.user.id,
        courseId,
        duration
      }
    })

    // Update user statistics
    const userStats = await prisma.userStatistics.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        totalTimeSpent: duration,
        currentStreak: 1
      },
      update: {
        totalTimeSpent: { increment: duration }
      }
    })

    // Update streak
    const today = new Date()
    const lastStudyDate = userStats.createdAt // Use createdAt as a fallback
    const dayDiff = Math.floor((today.getTime() - lastStudyDate.getTime()) / (1000 * 60 * 60 * 24))

    let currentStreak = userStats.currentStreak

    if (dayDiff <= 1) {
      // Maintain or increment streak
      currentStreak += dayDiff === 0 ? 0 : 1
    } else {
      // Reset streak
      currentStreak = 1
    }

    // Update streaks
    await prisma.userStatistics.update({
      where: { userId: session.user.id },
      data: {
        currentStreak
      }
    })

    // Update course progress
    if (courseId) {
      const courseProgress = await prisma.courseProgress.upsert({
        where: {
          userId_courseId: {
            userId: session.user.id,
            courseId
          }
        },
        create: {
          userId: session.user.id,
          courseId,
          progress: duration,
          totalTimeSpent: duration,
          lastAccessedAt: new Date()
        },
        update: {
          progress: { increment: duration },
          totalTimeSpent: { increment: duration },
          lastAccessedAt: new Date()
        }
      })

      // Check if course is completed
      const course = await prisma.course.findUnique({
        where: { id: courseId }
      })

      if (course && courseProgress.totalTimeSpent >= Number(course.duration)) {
        await prisma.courseProgress.update({
          where: {
            userId_courseId: {
              userId: session.user.id,
              courseId
            }
          },
          data: {
            completedAt: new Date()
          }
        })

        // Emit achievement update
        emitDashboardUpdate(session.user.id, "achievement", {
          type: "course_completion",
          courseId
        })
      }
    }

    // Get updated stats for real-time update
    const updatedStats = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        courseProgress: true,
        statistics: true
      }
    })

    if (updatedStats) {
      const completedCourses = updatedStats.courseProgress.filter(p => p.completedAt).length
      const totalProgress = updatedStats.courseProgress.length > 0
        ? updatedStats.courseProgress.reduce((acc, curr) => acc + curr.progress, 0) / updatedStats.courseProgress.length
        : 0

      // Emit real-time updates
      emitDashboardUpdate(session.user.id, "study_time", {
        totalStudyTime: updatedStats.statistics?.totalTimeSpent || 0
      })

      emitDashboardUpdate(session.user.id, "course_progress", {
        completedCourses,
        totalProgress
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Study session error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const studySessions = await prisma.studySession.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        course: {
          select: {
            title: true
          }
        }
      }
    })

    return NextResponse.json(studySessions)
  } catch (error) {
    console.error("Get study sessions error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 