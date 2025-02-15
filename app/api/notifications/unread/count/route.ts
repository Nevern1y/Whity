import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Get unread notifications count
    const count = await prisma.notification.count({
      where: {
        userId: session.user.id,
        read: false
      }
    })

    return NextResponse.json({ count })
  } catch (error) {
    console.error("[NOTIFICATIONS_COUNT]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 