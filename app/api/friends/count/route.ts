import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const friendsCount = await prisma.friendship.count({
      where: {
        status: 'ACCEPTED',
        OR: [
          { senderId: session.user.id },
          { receiverId: session.user.id }
        ]
      }
    })

    return NextResponse.json({ count: friendsCount })
  } catch (error) {
    console.error("[FRIENDS_COUNT]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 