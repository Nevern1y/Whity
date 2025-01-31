import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Level, Prisma } from "@prisma/client"

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const level = searchParams.get('level') as Level | null

    const courses = await prisma.course.findMany({
      where: {
        published: true,
        ...(level && { level }),
        ...(search && {
          OR: [
            { title: { contains: search } },
            { description: { contains: search } }
          ]
        }),
      },
      include: {
        progress: {
          where: {
            userId: session.user.id
          },
          select: {
            completed: true
          }
        },
        _count: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Преобразуем данные для фронтенда
    const formattedCourses = courses.map(course => ({
      id: course.id,
      title: course.title,
      description: course.description,
      image: course.image || '',
      level: course.level,
      duration: course.duration,
      usersCount: course._count.progress,
      progress: course.progress[0]?.completed || 0
    }))

    return NextResponse.json(formattedCourses)
  } catch (error) {
    console.error("[COURSES_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const data = await request.json()
    const course = await prisma.course.create({
      data: {
        title: data.title,
        description: data.description,
        image: data.image,
        level: data.level as Level,
        duration: data.duration,
        published: data.published || false,
        authorId: session.user.id
      }
    })

    return NextResponse.json(course, { status: 201 })
  } catch (error) {
    console.error("Error creating course:", error)
    return NextResponse.json(
      { error: "Failed to create course" },
      { status: 500 }
    )
  }
}

