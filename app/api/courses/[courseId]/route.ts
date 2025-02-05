import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Проверяем права (только админ или автор курса может удалить)
    const course = await prisma.course.findUnique({
      where: { id: params.courseId },
      select: { authorId: true }
    })

    if (!course) {
      return new NextResponse("Course not found", { status: 404 })
    }

    if (course.authorId !== session.user.id && session.user.role !== 'ADMIN') {
      return new NextResponse("Forbidden", { status: 403 })
    }

    // Удаляем курс и все связанные данные
    await prisma.course.delete({
      where: { id: params.courseId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[COURSE_DELETE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const values = await req.json()
    const { title, description, image, level, duration } = values

    // Проверяем права
    const course = await prisma.course.findUnique({
      where: { id: params.courseId },
      select: { authorId: true }
    })

    if (!course) {
      return new NextResponse("Course not found", { status: 404 })
    }

    if (course.authorId !== session.user.id && session.user.role !== 'ADMIN') {
      return new NextResponse("Forbidden", { status: 403 })
    }

    // Обновляем курс только с существующими в схеме полями
    const updatedCourse = await prisma.course.update({
      where: { id: params.courseId },
      data: {
        title,
        description,
        image,
        level,
        duration
      }
    })

    return NextResponse.json(updatedCourse)
  } catch (error) {
    console.error("[COURSE_UPDATE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function GET(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const course = await prisma.course.findUnique({
      where: { id: params.courseId },
      select: {
        title: true,
        description: true,
        image: true,
        level: true,
        duration: true,
        authorId: true
      }
    })

    if (!course) {
      return new NextResponse("Course not found", { status: 404 })
    }

    // Преобразуем путь к изображению, если необходимо
    const formattedCourse = {
      ...course,
      image: course.image ? (course.image.startsWith('/') ? course.image : `/uploads/${course.image}`) : null
    }

    return NextResponse.json(formattedCourse)
  } catch (error) {
    console.error("[COURSE_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 