import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { emitSocketEvent } from "@/lib/socket-server"

const MESSAGES_PER_PAGE = 50

export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const cursor = searchParams.get("cursor")
    const recipientId = params.userId

    // Validate recipient
    if (recipientId === session.user.id) {
      return new NextResponse("Cannot message yourself", { status: 400 })
    }

    // Get recipient status
    const recipient = await prisma.user.findUnique({
      where: { id: recipientId },
      select: {
        id: true,
        isOnline: true,
        lastActive: true,
      },
    })

    if (!recipient) {
      return new NextResponse("Recipient not found", { status: 404 })
    }

    // Check friendship status
    const friendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          {
            senderId: session.user.id,
            receiverId: recipientId,
          },
          {
            senderId: recipientId,
            receiverId: session.user.id,
          },
        ],
      },
    })

    if (!friendship) {
      return new NextResponse("No friendship found", { status: 403 })
    }

    if (friendship.status !== 'ACCEPTED') {
      return new NextResponse(
        friendship.status === 'PENDING'
          ? "Friend request is pending"
          : "Users must be friends to view messages",
        { status: 403 }
      )
    }

    // Query messages with pagination
    const messages = await prisma.message.findMany({
      take: MESSAGES_PER_PAGE,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      where: {
        OR: [
          {
            senderId: session.user.id,
            receiverId: recipientId,
          },
          {
            senderId: recipientId,
            receiverId: session.user.id,
          },
        ],
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        senderId: true,
        receiverId: true,
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    const nextCursor = messages.length === MESSAGES_PER_PAGE ? messages[messages.length - 1].id : undefined

    return NextResponse.json({
      messages: messages.reverse(),
      nextCursor,
      recipient: {
        isOnline: recipient.isOnline,
        lastActive: recipient.lastActive,
      },
    })
  } catch (error) {
    console.error("[MESSAGES_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const recipientId = params.userId
    const { content } = await request.json()

    if (!content?.trim()) {
      return new NextResponse("Message content is required", { status: 400 })
    }

    // Check if recipient exists
    const recipient = await prisma.user.findUnique({
      where: { id: recipientId },
      select: {
        id: true,
        isOnline: true,
        lastActive: true,
      }
    })

    if (!recipient) {
      return new NextResponse("Recipient not found", { status: 404 })
    }

    // Check if users are friends
    const friendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          {
            senderId: session.user.id,
            receiverId: recipientId,
            status: 'ACCEPTED',
          },
          {
            senderId: recipientId,
            receiverId: session.user.id,
            status: 'ACCEPTED',
          },
        ],
      },
    })

    if (!friendship) {
      return new NextResponse("Users must be friends to exchange messages", { status: 403 })
    }

    // Create message and update friendship in a transaction
    const [message] = await prisma.$transaction([
      prisma.message.create({
        data: {
          content,
          sender: { connect: { id: session.user.id } },
          receiver: { connect: { id: recipientId } },
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      }),
      prisma.friendship.update({
        where: { id: friendship.id },
        data: { updatedAt: new Date() },
      }),
    ])

    // Create activity log
    await prisma.activity.create({
      data: {
        userId: session.user.id,
        type: 'MESSAGE',
        description: `Отправил сообщение пользователю`,
        metadata: {
          receiverId: recipientId,
          title: 'Отправил сообщение'
        }
      }
    })

    // Emit socket event
    emitSocketEvent("new_message", {
      id: message.id,
      content: message.content,
      senderId: message.sender.id,
      receiverId: recipientId,
      createdAt: message.createdAt,
      sender: message.sender,
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error("[MESSAGES_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 