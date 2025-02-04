import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Friendship, User } from "@prisma/client"

interface FriendshipWithUsers extends Friendship {
  sender: {
    id: string
    name: string | null
    email: string | null
    image: string | null
  }
  receiver: {
    id: string
    name: string | null
    email: string | null
    image: string | null
  }
}

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const userId = session.user.id // Сохраняем ID в переменную

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''

    // Если запрос пустой, возвращаем только друзей
    if (!query) {
      const friends = await prisma.friendship.findMany({
        where: {
          OR: [
            { senderId: userId, status: 'ACCEPTED' },
            { receiverId: userId, status: 'ACCEPTED' }
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
      }) as FriendshipWithUsers[]

      const friendsList = friends.map((f: FriendshipWithUsers) => {
        const friend = f.senderId === userId ? f.receiver : f.sender
        return {
          ...friend,
          friendshipStatus: 'ACCEPTED' as const
        }
      })

      return NextResponse.json(friendsList)
    }

    // Если есть поисковый запрос, ищем пользователей
    const users = await prisma.user.findMany({
      where: {
        NOT: { id: userId },
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } }
        ]
      },
      take: 10
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error("[USERS_SEARCH]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 