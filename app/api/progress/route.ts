import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get("courseId")

    const progress = await prisma.progress.findMany({
      where: {
        user: { email: session.user.email },
        ...(courseId && { courseId })
      },
      include: {
        lesson: {
          select: {
            title: true,
            position: true
          }
        }
      }
    })

    return NextResponse.json(progress)
  } catch (error) {
    console.error("Error fetching progress:", error)
    return NextResponse.json(
      { error: "Failed to fetch progress" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { lessonId, courseId, completed, timeSpent } = await request.json()

    const progress = await prisma.progress.findFirst({
      where: {
        userId: session.user.id,
        courseId,
        lessonId
      }
    })

    await prisma.progress.update({
      where: {
        userId_courseId_lessonId: {
          userId: session.user.id,
          courseId,
          lessonId
        }
      },
      data: {
        completed,
        totalTimeSpent: timeSpent
      }
    })

    await prisma.activity.create({
      data: {
        type: "course_progress",
        description: `Completed lesson in course`,
        userId: session.user.id,
        metadata: {
          courseId,
          lessonId,
          completed
        }
      }
    })

    return NextResponse.json(progress)
  } catch (error) {
    console.error("Error updating progress:", error)
    return NextResponse.json(
      { error: "Failed to update progress" },
      { status: 500 }
    )
  }
} 