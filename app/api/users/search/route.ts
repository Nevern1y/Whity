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

// Добавляем интерфейс для пользователя с дружбами
interface UserWithFriendships {
  id: string
  name: string | null
  email: string | null
  image: string | null
  isOnline: boolean
  lastActive: Date | null
  sentFriendships: { status: string }[]
  receivedFriendships: { status: string }[]
}

// Интерфейс для результата
interface UserWithFriendshipStatus {
  id: string
  name: string | null
  email: string | null
  image: string | null
  isOnline: boolean
  lastActive: Date | null
  friendshipStatus: 'NONE' | 'PENDING' | 'ACCEPTED' | 'REJECTED'
  isIncoming: boolean
}

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const userId = session.user.id

    // Если нет поискового запроса, возвращаем пустой массив
    if (!query) {
      return NextResponse.json([])
    }

    const lowercaseQuery = query.toLowerCase()

    // Ищем пользователей с информацией о дружбе
    const users = await prisma.user.findMany({
      where: {
        NOT: { id: userId },
        OR: [
          { 
            name: {
              contains: lowercaseQuery
            } 
          },
          { 
            email: {
              contains: lowercaseQuery
            } 
          }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        isOnline: true,
        lastActive: true,
        // Добавляем информацию о входящих и исходящих заявках в друзья
        sentFriendships: {
          where: { receiverId: userId },
          select: { status: true }
        },
        receivedFriendships: {
          where: { senderId: userId },
          select: { status: true }
        }
      },
      take: 10
    })

    // Добавляем типизацию в map
    const usersWithFriendshipStatus = users.map((user: UserWithFriendships): UserWithFriendshipStatus => {
      const sentFriendship = user.sentFriendships[0]
      const receivedFriendship = user.receivedFriendships[0]
      const friendshipStatus = (sentFriendship?.status || receivedFriendship?.status || 'NONE') as 'NONE' | 'PENDING' | 'ACCEPTED' | 'REJECTED'
      const isIncoming = !!sentFriendship

      // Удаляем лишние поля
      const { sentFriendships, receivedFriendships, ...userData } = user

      return {
        ...userData,
        friendshipStatus,
        isIncoming
      }
    })

    return NextResponse.json(usersWithFriendshipStatus)
  } catch (error) {
    console.error("[USERS_SEARCH]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 