import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createNotification } from "@/lib/notifications"

interface User {
  id: string
  name: string | null
  image: string | null
}

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (user?.role !== "ADMIN") {
      return new NextResponse("Forbidden", { status: 403 })
    }

    const news = await prisma.news.findMany({
      include: {
        author: {
          select: {
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    return NextResponse.json(news)
  } catch (error) {
    console.error("[NEWS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (user?.role !== "ADMIN") {
      return new NextResponse("Forbidden", { status: 403 })
    }

    const { title, content, image } = await req.json()

    const news = await prisma.news.create({
      data: {
        title,
        content,
        image,
        authorId: session.user.id,
      },
    })

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        image: true
      }
    })
    await Promise.all(
      users.map((user: User) => 
        createNotification({
          userId: user.id,
          title: "Новая публикация",
          message: `Опубликована новая статья: ${title}`,
          type: "news",
          link: `/news/${news.id}`,
          metadata: { newsId: news.id }
        })
      )
    )

    return NextResponse.json(news)
  } catch (error) {
    console.error("[NEWS_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 