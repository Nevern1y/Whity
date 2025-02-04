import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { getIO } from "@/lib/socket-server"
import { FriendshipStatus } from "@prisma/client"
import { FriendshipValidator } from "@/lib/friendship-validator"
import { FRIENDSHIP_STATUS } from "@/lib/constants"

const friendRequestSchema = z.object({
  targetUserId: z.string().min(1)
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

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validation = friendRequestSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 })
    }

    const { targetUserId } = validation.data

    if (targetUserId === session.user.id) {
      return NextResponse.json(
        { error: "Cannot send friend request to yourself" },
        { status: 400 }
      )
    }

    // Проверяем существующую дружбу
    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { senderId: session.user.id, receiverId: targetUserId },
          { senderId: targetUserId, receiverId: session.user.id }
        ]
      }
    })

    if (existingFriendship) {
      return NextResponse.json(
        { error: "Friendship already exists", status: existingFriendship.status },
        { status: 400 }
      )
    }

    // Создаем новую заявку в друзья
    const friendship = await prisma.friendship.create({
      data: {
        senderId: session.user.id,
        receiverId: targetUserId,
        status: FRIENDSHIP_STATUS.PENDING
      }
    })

    // Отправляем уведомление через сокет
    const io = getIO()
    if (io) {
      io.to(targetUserId).emit('friend_request', {
        senderId: session.user.id,
        status: FRIENDSHIP_STATUS.PENDING
      })
    }

    // Получаем информацию о пользователе
    const sender = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { 
        id: true, 
        name: true,
        email: true,
        image: true
      }
    })

    if (!sender) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Проверяем существование целевого пользователя
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId }
    })

    if (!targetUser) {
      return NextResponse.json({ error: "Target user not found" }, { status: 404 })
    }

    // Создаем уведомление в базе
    await prisma.notification.create({
      data: {
        userId: targetUserId,
        type: 'FRIEND_REQUEST',
        title: 'Новая заявка в друзья',
        message: `${sender.name || 'Пользователь'} хочет добавить вас в друзья`,
        link: '/friends'
      }
    })

    return NextResponse.json(friendship)
  } catch (error) {
    console.error("[FRIENDS_POST]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
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

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const friends = await prisma.friendship.findMany({
      where: {
        OR: [
          { senderId: session.user.id },
          { receiverId: session.user.id }
        ],
        status: FRIENDSHIP_STATUS.ACCEPTED
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

    return NextResponse.json(friends)
  } catch (error) {
    console.error("[FRIENDS_GET]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 