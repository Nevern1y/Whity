import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Обновляем только поле read
    await prisma.notification.updateMany({
      where: {
        userId: session.user.id,
        read: false
      },
      data: {
        read: true
      }
    })

    // Получаем обновленные уведомления
    const notifications = await prisma.notification.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(notifications)
  } catch (error) {
    console.error("[NOTIFICATIONS_MARK_ALL_READ]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

// Добавляем обработчик OPTIONS для CORS
export async function OPTIONS(req: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
} 