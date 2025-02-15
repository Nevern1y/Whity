import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { getIO } from "@/lib/socket-server"
import { Prisma } from "@prisma/client"
import { FriendshipValidator } from "@/lib/friendship-validator"
import { FRIENDSHIP_STATUS, type FriendshipStatus } from "@/lib/constants"
import { emitSocketEvent } from "@/lib/socket-server"

const friendRequestSchema = z.object({
  targetUserId: z.string().min(1, "User ID is required")
})

interface Friendship {
  id: string
  senderId: string
  receiverId: string
  status: 'NONE' | 'PENDING' | 'ACCEPTED' | 'REJECTED'
}

interface FriendWithFriendships {
  id: string
  name: string | null
  email: string | null
  image: string | null
  sentFriendships: Friendship[]
  receivedFriendships: Friendship[]
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    let body
    try {
      body = await req.json()
    } catch (e) {
      return new NextResponse("Invalid request body", { status: 400 })
    }

    // Validate request body
    const result = friendRequestSchema.safeParse(body)
    if (!result.success) {
      return new NextResponse(
        JSON.stringify({ errors: result.error.errors }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const { targetUserId } = result.data

    // Validate self-friend request
    if (targetUserId === session.user.id) {
      return new NextResponse(
        JSON.stringify({ error: "Cannot add yourself as a friend" }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId }
    })

    if (!targetUser) {
      return new NextResponse(
        JSON.stringify({ error: "User not found" }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Check existing friendship
    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          {
            senderId: session.user.id,
            receiverId: targetUserId,
          },
          {
            senderId: targetUserId,
            receiverId: session.user.id,
          }
        ]
      }
    })

    if (existingFriendship) {
      const status = existingFriendship.status
      const error = status === 'PENDING'
        ? "Friend request already sent"
        : status === 'ACCEPTED'
        ? "Already friends"
        : "Cannot send friend request"

      return new NextResponse(
        JSON.stringify({ error, status }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Create new friendship
    const friendship = await prisma.friendship.create({
      data: {
        senderId: session.user.id,
        receiverId: targetUserId,
        status: FRIENDSHIP_STATUS.PENDING,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          }
        }
      }
    })

    // Create notification for receiver
    await prisma.notification.create({
      data: {
        userId: targetUserId,
        type: 'FRIEND_REQUEST',
        title: 'Новый запрос в друзья',
        message: `${session.user.name || 'Пользователь'} хочет добавить вас в друзья`,
        link: `/friends`
      }
    })

    // Emit socket event
    emitSocketEvent("friendship_request", {
      friendshipId: friendship.id,
      sender: friendship.sender,
      receiver: friendship.receiver,
    })

    return NextResponse.json(friendship)
  } catch (error) {
    console.error("[FRIENDS_POST]", error)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return new NextResponse(
        JSON.stringify({ error: "Database error", code: error.code }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

// Принятие/отклонение запроса в друзья
export async function PATCH(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { friendshipId, action } = await req.json()
    
    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId },
      include: { sender: true }
    })

    if (!friendship || friendship.receiverId !== session.user.id) {
      return new NextResponse("Not found", { status: 404 })
    }

    const updatedFriendship = await prisma.friendship.update({
      where: { id: friendshipId },
      data: { status: action === 'accept' ? 'ACCEPTED' : 'REJECTED' }
    })

    // Отправляем уведомление через сокет
    const io = getIO()
    const newStatus: FriendshipStatus = action === 'accept' ? 'ACCEPTED' : 'REJECTED'
    if (io) {
      io.to(friendship.senderId).emit('friend_request_response', {
        friendshipId,
        status: newStatus
      })
    }

    // Уведомление для отправителя
    await prisma.notification.create({
      data: {
        userId: friendship.senderId,
        type: 'FRIEND_REQUEST_RESPONSE',
        title: action === 'accept' ? 'Запрос в друзья принят' : 'Запрос в друзья отклонен',
        message: action === 'accept' 
          ? `${session.user.name} принял(а) ваш запрос в друзья`
          : `${session.user.name} отклонил(а) ваш запрос в друзья`,
        link: `/profile/${session.user.id}`
      }
    })

    return NextResponse.json(updatedFriendship)
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const userId = session.user.id

    // Get all friendships for the current user
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            isOnline: true,
            lastActive: true,
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            isOnline: true,
            lastActive: true,
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    // Filter out invalid friendships
    const validFriendships = friendships.filter(friendship => {
      const senderValid = friendship.sender && friendship.sender.id
      const receiverValid = friendship.receiver && friendship.receiver.id
      return senderValid && receiverValid
    })

    return NextResponse.json(validFriendships)
  } catch (error) {
    console.error("[FRIENDS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 