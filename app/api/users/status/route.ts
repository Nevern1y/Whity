import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getIO } from "@/lib/socket-server"

// Время в минутах, после которого пользователь считается не в сети
const OFFLINE_THRESHOLD = 2 * 60 * 1000 // 2 минуты (уменьшаем порог)

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return new NextResponse("User ID is required", { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        lastActive: true,
        isOnline: true
      }
    })

    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    const now = new Date().getTime()
    const lastActive = user.lastActive?.getTime() || 0
    const isTimeout = now - lastActive > OFFLINE_THRESHOLD

    // Если пользователь неактивен дольше порога - считаем его оффлайн
    const isOnline = !isTimeout && user.isOnline

    // Всегда обновляем статус, если он не соответствует реальному
    if (user.isOnline !== isOnline) {
      await prisma.user.update({
        where: { id: userId },
        data: { 
          isOnline,
          lastActive: isOnline ? new Date() : user.lastActive // Обновляем lastActive только если онлайн
        }
      })

      const io = getIO()
      if (io) {
        io.emit('user_status', { userId, isOnline })
      }
    }

    return NextResponse.json({ isOnline })
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 })
  }
} 