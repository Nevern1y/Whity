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

    const { receiverId, content } = await req.json()

    // Проверяем статус дружбы
    const friendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { senderId: session.user.id, receiverId },
          { senderId: receiverId, receiverId: session.user.id }
        ],
        status: 'ACCEPTED'
      }
    })

    if (!friendship) {
      return new NextResponse("You can only send messages to friends", { status: 403 })
    }

    const message = await prisma.message.create({
      data: {
        content,
        senderId: session.user.id,
        receiverId,
      },
      include: {
        sender: true
      }
    })

    // Отправляем сообщение через сокет
    const io = getIO()
    if (io) {
      io.to(receiverId).emit('new_message', {
        id: message.id,
        content: message.content,
        senderId: message.senderId,
        createdAt: message.createdAt,
        sender: {
          name: message.sender.name,
          image: message.sender.image
        }
      })
    }

    return NextResponse.json(message)
  } catch (error) {
    console.error("[MESSAGES_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 