import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Level, Course, Prisma } from "@prisma/client"

type CourseWithRelations = Course & {
  author: {
    id: string
    name: string | null
    email: string | null
  }
  lessons: {
    id: string
    title: string
    position: number
  }[]
  courseRatings: {
    rating: number
  }[]
  _count: {
    students: number
  }
}

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
  lessons: {
    id: string
    title: string
    position: number
  }[]
  rating: number
  studentsCount: number
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id || !["ADMIN", "MANAGER"].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const course = await prisma.course.findUnique({
      where: { id: params.id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        lessons: {
          select: {
            id: true,
            title: true,
            position: true
          }
        },
        courseRatings: {
          select: {
            rating: true
          }
        },
        _count: true
      }
    }) as CourseWithRelations | null

    if (!course) {
      return new NextResponse("Course not found", { status: 404 })
    }

    // Преобразуем данные для фронтенда
    const formattedCourse: FormattedCourse = {
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
      lessons: course.lessons,
      rating: course.courseRatings.length > 0
        ? course.courseRatings.reduce((acc: number, curr: { rating: number }) => acc + curr.rating, 0) / course.courseRatings.length
        : 0,
      studentsCount: course._count.students
    }

    return NextResponse.json(formattedCourse)
  } catch (error) {
    console.error("[COURSE_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id || !["ADMIN", "MANAGER"].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { title, description, image, level, published } = body

    const course = await prisma.course.findUnique({
      where: { id: params.id }
    })

    if (!course) {
      return new NextResponse("Course not found", { status: 404 })
    }

    // Обновляем курс
    const updatedCourse = await prisma.course.update({
      where: { id: params.id },
      data: {
        title: title || course.title,
        description: description || course.description,
        image: image || course.image,
        level: level || course.level,
        published: published ?? course.published
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
        type: "COURSE_UPDATED",
        description: `Обновлен курс "${updatedCourse.title}"`,
        metadata: {
          courseId: updatedCourse.id,
          title: updatedCourse.title,
          changes: {
            title: title !== course.title,
            description: description !== course.description,
            image: image !== course.image,
            level: level !== course.level,
            published: published !== course.published
          }
        }
      }
    })

    return NextResponse.json(updatedCourse)
  } catch (error) {
    console.error("[COURSE_PATCH]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id || !["ADMIN", "MANAGER"].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const course = await prisma.course.findUnique({
      where: { id: params.id },
      include: {
        _count: true
      }
    })

    if (!course) {
      return new NextResponse("Course not found", { status: 404 })
    }

    // Проверяем, есть ли у курса студенты
    if (course._count.students > 0) {
      return new NextResponse(
        "Cannot delete course with enrolled students", 
        { status: 400 }
      )
    }

    // Удаляем курс и все связанные данные
    await prisma.$transaction([
      // Удаляем уроки
      prisma.lesson.deleteMany({
        where: { courseId: params.id }
      }),
      // Удаляем рейтинги
      prisma.courseRating.deleteMany({
        where: { courseId: params.id }
      }),
      // Удаляем сам курс
      prisma.course.delete({
        where: { id: params.id }
      })
    ])

    // Создаем запись в логе активности
    await prisma.activity.create({
      data: {
        userId: session.user.id,
        type: "COURSE_DELETED",
        description: `Удален курс "${course.title}"`,
        metadata: {
          courseId: course.id,
          title: course.title
        }
      }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[COURSE_DELETE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 