import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id || !["ADMIN", "MANAGER"].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { published } = await req.json()

    const course = await prisma.course.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        title: true,
        published: true,
        lessons: {
          select: { id: true }
        }
      }
    })

    if (!course) {
      return new NextResponse("Course not found", { status: 404 })
    }

    // Проверяем, есть ли у курса уроки перед публикацией
    if (published && course.lessons.length === 0) {
      return new NextResponse(
        "Cannot publish course without lessons",
        { status: 400 }
      )
    }

    // Обновляем статус публикации
    const updatedCourse = await prisma.course.update({
      where: { id: params.id },
      data: { published }
    })

    // Создаем запись в логе активности
    await prisma.activity.create({
      data: {
        userId: session.user.id,
        type: published ? "COURSE_PUBLISHED" : "COURSE_UNPUBLISHED",
        description: published 
          ? `Опубликован курс "${course.title}"`
          : `Отменена публикация курса "${course.title}"`,
        metadata: {
          courseId: course.id,
          title: course.title
        }
      }
    })

    return NextResponse.json(updatedCourse)
  } catch (error) {
    console.error("[COURSE_PUBLISH]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 