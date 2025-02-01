import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const requests = await prisma.friendship.findMany({
      where: {
        receiverId: session.user.id,
        status: 'PENDING'
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    })

    return NextResponse.json(requests)
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 })
  }
} 