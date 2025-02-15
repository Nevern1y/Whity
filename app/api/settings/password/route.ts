import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import bcrypt from "bcryptjs"

// Схема валидации для смены пароля
const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Введите текущий пароль"),
  newPassword: z
    .string()
    .min(8, "Пароль должен содержать минимум 8 символов")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Пароль должен содержать хотя бы одну заглавную букву, одну строчную букву и одну цифру"
    ),
})

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Необходима авторизация" },
        { status: 401 }
      )
    }

    const body = await req.json()
    
    // Валидация данных
    const validationResult = passwordChangeSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      )
    }

    const { currentPassword, newPassword } = validationResult.data

    // Получаем текущий хэш пароля пользователя
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { hashedPassword: true }
    })

    if (!user?.hashedPassword) {
      return NextResponse.json(
        { error: "Пользователь не найден или использует внешнюю авторизацию" },
        { status: 400 }
      )
    }

    // Проверяем текущий пароль
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.hashedPassword
    )

    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: "Неверный текущий пароль" },
        { status: 401 }
      )
    }

    // Хэшируем новый пароль
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // Обновляем пароль
    await prisma.user.update({
      where: { id: session.user.id },
      data: { 
        hashedPassword,
        updatedAt: new Date()
      }
    })

    // Создаем запись в активности
    await prisma.activity.create({
      data: {
        userId: session.user.id,
        type: 'PASSWORD_CHANGE',
        description: 'Изменил пароль',
        metadata: {
          timestamp: new Date().toISOString()
        }
      }
    })

    // Создаем запись в логах безопасности
    await prisma.securityLog.create({
      data: {
        userId: session.user.id,
        event: 'PASSWORD_CHANGE',
        ip: req.headers.get('x-forwarded-for') || 'unknown',
        location: 'unknown'
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[PASSWORD_CHANGE]", error)
    return NextResponse.json(
      { error: "Произошла ошибка при смене пароля" },
      { status: 500 }
    )
  }
} 