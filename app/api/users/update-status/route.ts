import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getIO } from "@/lib/socket-server"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Обновляем пользователя
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { 
        isOnline: true,
        lastActive: new Date()
      }
    })

    // Оповещаем через сокеты
    const io = getIO()
    if (io) {
      io.emit('user_status', { 
        userId: session.user.id, 
        isOnline: true 
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating status:', error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 