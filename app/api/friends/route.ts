import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { targetUserId } = await req.json()
    
    // Проверяем, существует ли уже запрос в друзья
    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { senderId: session.user.id, receiverId: targetUserId },
          { senderId: targetUserId, receiverId: session.user.id }
        ]
      }
    })

    if (existingFriendship) {
      return new NextResponse("Friendship request already exists", { status: 400 })
    }

    // Создаем запрос в друзья
    const friendship = await prisma.friendship.create({
      data: {
        senderId: session.user.id,
        receiverId: targetUserId,
        status: 'PENDING'
      }
    })

    // Создаем уведомление для получателя
    await prisma.notification.create({
      data: {
        userId: targetUserId,
        type: 'FRIEND_REQUEST',
        title: 'Новый запрос в друзья',
        message: `${session.user.name} хочет добавить вас в друзья`,
        link: `/profile/${session.user.id}`
      }
    })

    return NextResponse.json(friendship)
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 })
  }
}

// Принятие/отклонение запроса в друзья
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)
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
    const session = await getServerSession()
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const friends = await prisma.friendship.findMany({
      where: {
        OR: [
          { senderId: session.user.id },
          { receiverId: session.user.id }
        ],
        status: "ACCEPTED"
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            image: true,
          }
        }
      }
    })

    return NextResponse.json(friends)
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 })
  }
} 