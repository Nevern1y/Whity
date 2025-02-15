import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Level, Course, Prisma } from "@prisma/client"

type CourseWithRelations = Prisma.CourseGetPayload<{
  include: {
    author: {
      select: {
        id: true
        name: true
        email: true
      }
    }
    _count: true
    courseRatings: {
      select: {
        rating: true
      }
    }
  }
}>

interface FormattedCourse {
  id: string
  title: string
  description: string
  image: string | null
  published: boolean
  level: Level
  duration: string
  createdAt: Date
  updatedAt: Date
  authorId: string
  author: {
    id: string
    name: string | null
    email: string | null
  }
  rating: number
  studentsCount: number
}

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id || !["ADMIN", "MANAGER"].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const courses = await prisma.course.findMany({
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        _count: true,
        courseRatings: {
          select: {
            rating: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Преобразуем данные для фронтенда
    const formattedCourses: FormattedCourse[] = courses.map(course => {
      const ratings = course.courseRatings || []
      const averageRating = ratings.length > 0
        ? ratings.reduce((acc: number, curr: { rating: number }) => acc + curr.rating, 0) / ratings.length
        : 0

      return {
        id: course.id,
        title: course.title,
        description: course.description,
        image: course.image,
        published: course.published,
        level: course.level,
        duration: course.duration,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
        authorId: course.authorId,
        author: course.author,
        rating: averageRating,
        studentsCount: course._count.students || 0
      }
    })

    return NextResponse.json(formattedCourses)
  } catch (error) {
    console.error("[COURSES_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id || !["ADMIN", "MANAGER"].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { title, description, image, level } = body

    if (!title || !description || !image || !level) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    // Валидация уровня
    if (!Object.values(Level).includes(level)) {
      return new NextResponse("Invalid level", { status: 400 })
    }

    // Создаем новый курс
    const course = await prisma.course.create({
      data: {
        title,
        description,
        image,
        level: level as Level,
        authorId: session.user.id,
        duration: "0", // Значение по умолчанию
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    })

    // Создаем запись в логе активности
    await prisma.activity.create({
      data: {
        userId: session.user.id,
        type: "COURSE_CREATED",
        description: `Создан новый курс "${title}"`,
        metadata: {
          courseId: course.id,
          title: course.title
        }
      }
    })

    return NextResponse.json(course)
  } catch (error) {
    console.error("[COURSES_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 