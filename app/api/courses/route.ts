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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json() as CourseData
    
    const course = await prisma.course.create({
      data: {
        ...data,
        authorId: session.user.id,
        published: data.published ?? false
      },
      include: {
        author: {
          select: {
            name: true,
            image: true
          }
        }
      }
    }) as CourseWithAuthor

    return NextResponse.json(course)
  } catch (error) {
    return NextResponse.json({ error: "Failed to create course" }, { status: 500 })
  }
}

