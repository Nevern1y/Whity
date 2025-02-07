import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createNotification } from "@/lib/notifications"
import { getIO } from "@/lib/socket-server"

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const receiverId = searchParams.get("receiverId")

    if (!receiverId) {
      return NextResponse.json(
        { error: "Receiver ID is required" },
        { status: 400 }
      )
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          {
            senderId: session.user.id,
            receiverId: receiverId
          },
          {
            senderId: receiverId,
            receiverId: session.user.id
          }
        ]
      },
      include: {
        sender: {
          select: {
            name: true,
            image: true
          }
        },
        receiver: {
          select: {
            name: true,
            image: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { recipientId, content } = await req.json()

    if (!content || !recipientId) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    // Проверяем существование получателя
    const receiver = await prisma.user.findUnique({
      where: { id: recipientId }
    })

    if (!receiver) {
      return new NextResponse("Recipient not found", { status: 404 })
    }

    // Проверяем статус дружбы в обоих направлениях
    const friendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          {
            AND: [
              { senderId: session.user.id },
              { receiverId: recipientId },
              { status: 'ACCEPTED' }
            ]
          },
          {
            AND: [
              { senderId: recipientId },
              { receiverId: session.user.id },
              { status: 'ACCEPTED' }
            ]
          }
        ]
      }
    })

    if (!friendship) {
      return new NextResponse("Not friends", { status: 403 })
    }

    // Создаем сообщение с правильными связями
    const message = await prisma.message.create({
      data: {
        content,
        sender: {
          connect: { id: session.user.id }
        },
        receiver: {
          connect: { id: recipientId }
        }
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

    // Отправляем уведомление через сокет
    const io = getIO()
    if (io) {
      io.to(recipientId).emit('new_message', message)
    }

    // Создаем уведомление для получателя
    await prisma.notification.create({
      data: {
        userId: recipientId,
        type: 'NEW_MESSAGE',
        title: 'Новое сообщение',
        message: `${session.user.name || 'Пользователь'} отправил вам сообщение`,
        link: `/messages?userId=${session.user.id}`
      }
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error("[MESSAGES_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 