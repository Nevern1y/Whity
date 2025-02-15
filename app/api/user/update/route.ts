import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { Prisma } from "@prisma/client"

// Схема валидации для обновления профиля
const updateProfileSchema = z.object({
  name: z.string().min(2, "Имя должно содержать минимум 2 символа").optional(),
  email: z.string().email("Неверный формат email").optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  bio: z.string().optional(),
  image: z.string().nullable().optional(),
})

export async function PATCH(req: Request) {
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
    const validationResult = updateProfileSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Проверка уникальности email
    if (data.email) {
      const existingUser = await prisma.user.findUnique({
        where: {
          email: data.email,
          NOT: {
            id: session.user.id
          }
        }
      })

      if (existingUser) {
        return NextResponse.json(
          { error: "Этот email уже используется" },
          { status: 400 }
        )
      }
    }

    // Обновление профиля
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...data,
        updatedAt: new Date()
      }
    })

    // Создаем запись в активности
    await prisma.activity.create({
      data: {
        userId: session.user.id,
        type: 'PROFILE_UPDATE',
        description: 'Обновил профиль',
        metadata: {
          changes: Object.keys(data).join(', ')
        }
      }
    })

    return NextResponse.json({ 
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        image: updatedUser.image
      }
    })
  } catch (error) {
    console.error("[USER_UPDATE]", error)
    
    // Обработка ошибок MySQL
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: "Этот email уже используется" },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { error: "Произошла ошибка при обновлении профиля" },
      { status: 500 }
    )
  }
} 