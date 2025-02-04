import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getIO } from "@/lib/socket-server"
import { FRIENDSHIP_STATUS } from "@/lib/constants"

export async function PATCH(
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
      where: { id: friendshipId },
      select: {
        id: true,
        status: true,
        receiverId: true,
        senderId: true
      }
    })

    if (!friendship) {
      return new NextResponse("Friendship not found", { status: 404 })
    }

    // Проверяем, что текущий пользователь является получателем запроса
    if (friendship.receiverId !== session.user.id) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    // Обновляем статус дружбы
    const updatedFriendship = await prisma.friendship.update({
      where: { id: friendshipId },
      data: { status: "ACCEPTED" }
    })

    // Отправляем уведомление через сокет
    const io = getIO()
    if (io) {
      io.to(friendship.senderId).emit('friend_request_response', {
        friendshipId: friendship.id,
        status: FRIENDSHIP_STATUS.ACCEPTED
      })
    }

    // Создаем уведомление
    await prisma.notification.create({
      data: {
        userId: friendship.senderId,
        type: 'FRIEND_REQUEST_ACCEPTED',
        title: 'Заявка в друзья принята',
        message: `${session.user.name || 'Пользователь'} принял(а) вашу заявку в друзья`,
        link: `/friends`
      }
    })

    return NextResponse.json(updatedFriendship)
  } catch (error) {
    console.error("[FRIENDSHIP_ACCEPT]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 