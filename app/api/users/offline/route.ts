import { NextResponse } from "next/server"
import { checkAuth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { emitSocketEvent } from "@/lib/socket-server"

export async function POST(req: Request) {
  try {
    const session = await checkAuth()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const user = await prisma.user.upsert({
      where: { id: session.user.id },
      update: { 
        isOnline: false,
        lastActive: new Date()
      },
      create: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        isOnline: false,
        lastActive: new Date()
      }
    })

    // Emit socket event for real-time updates
    emitSocketEvent('user_status', { 
      userId: session.user.id, 
      isOnline: false 
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("Error setting offline status:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 