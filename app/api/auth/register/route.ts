import { hash } from "bcryptjs"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json()
    console.log("[REGISTER] Received data:", { email, name }) // не логируем пароль

    if (!email || !password || !name) {
      console.log("[REGISTER] Missing fields")
      return new NextResponse("Missing fields", { status: 400 })
    }

    // Проверяем, существует ли пользователь
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })
    console.log("[REGISTER] Existing user check:", !!existingUser)

    if (existingUser) {
      return new NextResponse("Email already exists", { status: 400 })
    }

    try {
      const hashedPassword = await hash(password, 10)

      const user = await prisma.user.create({
        data: {
          email,
          name,
          hashedPassword,
          role: "USER",
        }
      })

      // Создаем начальное уведомление для пользователя
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: "Добро пожаловать!",
          message: "Рады видеть вас на нашей платформе. Начните свое обучение прямо сейчас!",
          type: "WELCOME",
        }
      })

      console.log("[REGISTER] User created:", { id: user.id, email: user.email })
      
      return NextResponse.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      })
    } catch (dbError) {
      console.error("[REGISTER] Database error:", dbError)
      return new NextResponse("Database error", { status: 500 })
    }
  } catch (error) {
    console.error("[REGISTER_ERROR]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 