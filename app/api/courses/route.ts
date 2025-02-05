import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Level } from "@/types/prisma"

interface CourseData {
  title: string
  description: string
  image?: string
  level: Level
  duration: string
  published?: boolean
}

interface CourseWithAuthor {
  id: string
  title: string
  description: string
  image: string | null
  level: string
  duration: number
  published: boolean
  authorId: string
  author: {
    name: string | null
    image: string | null
  }
}

export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      where: {
        published: true
      },
      include: {
        author: {
          select: {
            name: true,
            image: true
          }
        },
        _count: {
          select: {
            students: true
          }
        }
      }
    })

    return NextResponse.json(courses)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    console.log('Received course data:', body)

    const { title, description, image, level, duration } = body

    // Валидация входных данных
    if (!title || !description || !level || !duration) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    const imageToSave = image ? image.replace('/uploads/', '') : null
    console.log('Saving image as:', imageToSave)

    const course = await prisma.course.create({
      data: {
        title,
        description,
        image: imageToSave,
        level,
        duration: String(duration),
        authorId: session.user.id,
        published: true
      },
      include: {
        author: {
          select: {
            name: true,
            image: true
          }
        },
        _count: {
          select: {
            students: true
          }
        }
      }
    })

    console.log('Created course:', course)
    return NextResponse.json(course)
  } catch (error) {
    console.error("[COURSES_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { id, ...data } = await req.json()

    const course = await prisma.course.findUnique({
      where: { id },
      select: { authorId: true }
    })

    if (!course) {
      return new NextResponse("Course not found", { status: 404 })
    }

    // Проверяем права на редактирование
    if (course.authorId !== session.user.id && session.user.role !== 'ADMIN') {
      return new NextResponse("Forbidden", { status: 403 })
    }

    const updatedCourse = await prisma.course.update({
      where: { id },
      data: {
        ...data,
        image: data.image ? data.image.replace('/uploads/', '') : null,
      }
    })

    return NextResponse.json(updatedCourse)
  } catch (error) {
    console.error("[COURSE_PATCH]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

