import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id || !["ADMIN", "MANAGER"].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
        lastActive: true,
        isOnline: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error("[ADMIN_USERS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { email, name, role = "USER" } = body

    if (!email || !name) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return new NextResponse("Email already exists", { status: 400 })
    }

    // Create new user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        role
      }
    })

    // Create activity log
    await prisma.activity.create({
      data: {
        userId: session.user.id,
        type: 'USER_CREATED',
        description: `Создан новый пользователь ${name}`,
        metadata: {
          userId: user.id,
          email: user.email
        }
      }
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("[ADMIN_USERS_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 