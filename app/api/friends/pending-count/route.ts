import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const pendingCount = await prisma.friendship.count({
      where: {
        receiverId: session.user.id,
        status: 'PENDING'
      }
    })

    return NextResponse.json({ count: pendingCount })
  } catch (error) {
    console.error("[PENDING_FRIENDS_COUNT]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 