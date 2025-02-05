import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Level } from "@/types/prisma"

interface CourseData {
  title: string
  description: string
  image?: string
  level: Level
  duration: number
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
      include: {
        author: {
          select: {
            name: true,
            image: true
          }
        }
      }
    })

    return NextResponse.json(courses)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await request.json()
    const { title, description, level, duration, image } = body

    const course = await prisma.course.create({
      data: {
        title,
        description,
        level,
        duration: String(duration),
        image: "/placeholder-course.jpg",
        authorId: session.user.id,
        published: true,
      },
      include: {
        author: {
          select: {
            name: true,
            image: true
          }
        }
      }
    })

    return NextResponse.json(course)
  } catch (error) {
    console.error("[COURSES_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

