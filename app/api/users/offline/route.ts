import { NextResponse } from "next/server"
import { checkAuth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { emitSocketEvent } from "@/lib/socket-server"

interface OfflineResponse {
  success: boolean
  user: {
    id: string
    isOnline: boolean
    lastActive: Date | null
  }
}

export async function POST(): Promise<NextResponse<OfflineResponse>> {
  try {
    console.log("[OFFLINE] Starting offline status update")
    
    // Проверяем заголовки запроса
    const session = await checkAuth()
    console.log("[OFFLINE] Session check:", { 
      hasSession: !!session,
      userId: session?.user?.id,
      cookies: !!session?.user?.id
    })

    if (!session) {
      console.log("[OFFLINE] No session found")
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { 
        isOnline: false,
        lastActive: new Date()
      },
      select: {
        id: true,
        isOnline: true,
        lastActive: true
      }
    })
    console.log("[OFFLINE] User status updated:", { 
      userId: user.id, 
      isOnline: user.isOnline 
    })

    // Оповещаем через сокеты
    emitSocketEvent("user:status", {
      userId: user.id,
      isOnline: false,
      lastActive: user.lastActive
    })

    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error("[OFFLINE_ERROR]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 