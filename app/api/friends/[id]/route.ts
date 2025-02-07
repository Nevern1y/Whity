import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getIO } from "@/lib/socket-server"
import { SOCKET_EVENTS } from "@/components/providers/socket-provider"

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const friendshipId = params.id
    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId }
    })

    if (!friendship) {
      return new NextResponse("Friendship not found", { status: 404 })
    }

    // Проверяем, что текущий пользователь является участником дружбы
    if (friendship.senderId !== session.user.id && 
        friendship.receiverId !== session.user.id) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    // Удаляем дружбу
    await prisma.friendship.delete({
      where: { id: friendshipId }
    })

    // Определяем ID другого пользователя
    const otherUserId = friendship.senderId === session.user.id 
      ? friendship.receiverId 
      : friendship.senderId

    // Отправляем уведомление через сокет
    const io = getIO()
    if (io) {
      io.to(otherUserId).emit('friendship_update', {
        type: 'REMOVED',
        friendshipId: friendship.id
      })
    }

    // Создаем уведомление
    await prisma.notification.create({
      data: {
        userId: otherUserId,
        type: 'FRIEND_REMOVED',
        title: 'Удаление из друзей',
        message: `${session.user.name || 'Пользователь'} удалил вас из друзей`,
        link: `/profile/${session.user.id}`
      }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[FRIENDSHIP_DELETE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const friendshipId = params.id
    const { action } = await request.json()

    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId },
      include: {
        sender: true,
        receiver: true
      }
    })

    if (!friendship) {
      return new NextResponse("Friendship not found", { status: 404 })
    }

    // Проверяем, что текущий пользователь является получателем запроса
    if (friendship.receiverId !== session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const updatedFriendship = await prisma.friendship.update({
      where: { id: friendshipId },
      data: {
        status: action === 'accept' ? 'ACCEPTED' : 'REJECTED'
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

    return NextResponse.json(updatedFriendship)
  } catch (error) {
    console.error("[FRIENDSHIP_ACTION]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 