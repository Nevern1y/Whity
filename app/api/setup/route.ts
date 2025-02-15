import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hash } from "bcryptjs"

const SETUP_SECRET = process.env.SETUP_SECRET // Добавьте этот секрет в .env

export async function POST(req: Request) {
  try {
    // Проверяем секретный ключ
    const { email, password, setupSecret } = await req.json()

    if (!SETUP_SECRET || setupSecret !== SETUP_SECRET) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Проверяем, есть ли уже администраторы
    const existingAdmin = await prisma.user.findFirst({
      where: { role: "ADMIN" }
    })

    if (existingAdmin) {
      return new NextResponse(
        "Setup already completed. Admin user exists.", 
        { status: 400 }
      )
    }

    // Проверяем существование пользователя
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (!existingUser) {
      // Создаем нового пользователя с ролью админа
      const hashedPassword = await hash(password, 12)
      
      const user = await prisma.user.create({
        data: {
          email,
          hashedPassword,
          role: "ADMIN"
        }
      })

      return NextResponse.json({
        message: "Admin user created successfully",
        userId: user.id
      })
    }

    // Если пользователь существует, повышаем его до админа
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { role: "ADMIN" }
    })

    // Создаем запись в логе активности
    await prisma.activity.create({
      data: {
        userId: updatedUser.id,
        type: "SETUP",
        description: "Initial admin setup completed",
        metadata: {
          method: existingUser ? "upgraded" : "created"
        }
      }
    })

    return NextResponse.json({
      message: "Existing user upgraded to admin",
      userId: updatedUser.id
    })

  } catch (error) {
    console.error("[SETUP_ERROR]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 