import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Схема валидации для входящих данных
const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  bio: z.string().max(500).optional(),
  image: z.string().url().optional(),
  // Добавьте другие поля, которые можно обновлять
})

export async function PATCH(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    
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
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Profile update error:", error)
    
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 400 })
    }
    
    return new NextResponse(
      "Internal Server Error", 
      { status: 500 }
    )
  }
} 