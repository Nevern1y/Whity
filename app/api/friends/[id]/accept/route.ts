import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Обновляем статус дружбы
    const friendship = await prisma.friendship.updateMany({
      where: {
        OR: [
          { senderId: session.user.id, receiverId: params.id },
          { senderId: params.id, receiverId: session.user.id }
        ],
        status: 'PENDING'
      },
      data: {
        status: 'ACCEPTED'
      }
    })

    // Возвращаем обновленный статус
    return NextResponse.json({ 
      success: true,
      status: 'ACCEPTED'
    })
  } catch (error) {
    console.error("[FRIENDSHIP_ACCEPT]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 