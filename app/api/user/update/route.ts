import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Обновляем схему валидации
const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  bio: z.string().max(500).optional(),
  image: z.string().optional(), // Убираем .url() для поддержки локальных путей
  preferences: z.any().optional(),
  settings: z.any().optional(),
}).partial() // Делаем все поля опциональными

export async function PATCH(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    
    try {
      // Валидируем входящие данные
      const validatedData = updateUserSchema.parse(body)

      // Обновляем только предоставленные поля
      const updatedUser = await prisma.user.update({
        where: {
          id: session.user.id
        },
        data: {
          ...validatedData,
          updatedAt: new Date()
        },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          bio: true,
          preferences: true,
          settings: true,
          updatedAt: true
        }
      })

      return NextResponse.json({
        success: true,
        user: updatedUser
      })
    } catch (validationError) {
      console.error("Validation error:", validationError)
      return NextResponse.json({
        success: false,
        error: "Invalid data provided",
        details: validationError instanceof z.ZodError ? validationError.errors : undefined
      }, { status: 400 })
    }

  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 })
  }
} 