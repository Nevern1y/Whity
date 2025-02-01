import { hash } from "bcryptjs"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, name, password } = body

    if (!email || !name || !password) {
      return NextResponse.json({ 
        message: "Не все поля заполнены" 
      }, { status: 400 })
    }

    // Проверяем, существует ли пользователь
    const existingUser = await prisma.user.findUnique({
      where: {
        email
      }
    })

    if (existingUser) {
      return NextResponse.json({ 
        message: "Пользователь с таким email уже существует" 
      }, { status: 409 })
    }

    // Хешируем пароль
    const hashedPassword = await hash(password, 10)

    // Создаем пользователя
    const user = await prisma.user.create({
      data: {
        email,
        name,
        hashedPassword,
        settings: {
          create: {
            theme: "system",
            fontSize: "md",
            language: "ru",
            timezone: "Europe/Moscow",
            notifications: {
              email: true,
              push: false,
              sounds: true,
              updates: true,
              newsletter: false
            }
          }
        },
        statistics: {
          create: {
            totalTimeSpent: 0,
            currentStreak: 0
          }
        }
      },
      include: {
        settings: true,
        statistics: true
      }
    })

    return NextResponse.json({
      success: true,
      message: "Регистрация успешна",
      user: {
        name: user.name,
        email: user.email
      }
    }, { status: 201 })
  } catch (error) {
    console.error("[REGISTER_ERROR]", error)
    return NextResponse.json({ 
      success: false,
      message: "Ошибка при регистрации" 
    }, { status: 500 })
  }
} 