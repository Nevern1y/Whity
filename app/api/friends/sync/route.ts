import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { Friendship } from "@prisma/client"

type FriendshipWithUsers = Friendship & {
  sender: { id: string } | null
  receiver: { id: string } | null
}

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Получаем все активные дружеские отношения
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { senderId: session.user.id },
          { receiverId: session.user.id }
        ],
        status: {
          in: ['ACCEPTED', 'PENDING']
        }
      },
      include: {
        sender: {
          select: { id: true }
        },
        receiver: {
          select: { id: true }
        }
      }
    })

    // Фильтруем удаленных пользователей
    const validFriendships = friendships.filter(
      (f: FriendshipWithUsers) => f.sender && f.receiver
    )

    // Если есть разница, обновляем статусы
    if (friendships.length !== validFriendships.length) {
      await Promise.all(
        friendships
          .filter((f: FriendshipWithUsers) => !f.sender || !f.receiver)
          .map((f: FriendshipWithUsers) => 
            prisma.friendship.delete({
              where: { id: f.id }
            })
          )
      )
    }

    const userId = session.user.id

    // Возвращаем актуальные данные
    return NextResponse.json({
      pendingCount: validFriendships.filter(
        (f: FriendshipWithUsers) => f.status === 'PENDING' && f.receiverId === userId
      ).length,
      totalFriends: validFriendships.filter(
        (f: FriendshipWithUsers) => f.status === 'ACCEPTED'
      ).length
    })
  } catch (error) {
    console.error("[FRIENDS_SYNC]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 