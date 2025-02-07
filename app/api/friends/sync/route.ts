import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import type { Prisma } from "@prisma/client"
import { FriendshipStatus } from "@/lib/constants"

type UserSelect = {
  id: string
  name: string | null
  email: string | null
  image: string | null
}

interface FriendshipWithUsers {
  id: string
  senderId: string
  receiverId: string
  status: FriendshipStatus
  createdAt: Date
  updatedAt: Date
  sender: UserSelect
  receiver: UserSelect
}

interface UserIdOnly {
  id: string
}

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Сначала получаем существующих пользователей
    const existingUsers = await prisma.user.findMany({
      select: { id: true }
    })
    const userIds = existingUsers.map((u: UserIdOnly) => u.id)

    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { 
            senderId: session.user.id,
            sender: { id: { in: userIds } },
            receiver: { id: { in: userIds } }
          },
          { 
            receiverId: session.user.id,
            sender: { id: { in: userIds } },
            receiver: { id: { in: userIds } }
          }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      }
    })

    return NextResponse.json(friendships)
  } catch (error) {
    console.error("[FRIENDS_SYNC]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 