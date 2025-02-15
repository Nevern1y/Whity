import { NextResponse } from "next/server"
import { auth } from "@/auth"
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

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const query = searchParams.get("q")

    if (!query) {
      return NextResponse.json([])
    }

    // Search users by name or email
    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            OR: [
              { name: { contains: query } },
              { email: { contains: query } }
            ]
          },
          { id: { not: session.user.id } } // Exclude current user
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        isOnline: true,
        lastActive: true,
        sentFriendships: {
          where: {
            OR: [
              { receiverId: session.user.id },
              { senderId: session.user.id }
            ]
          },
          select: {
            id: true,
            status: true
          }
        },
        receivedFriendships: {
          where: {
            OR: [
              { receiverId: session.user.id },
              { senderId: session.user.id }
            ]
          },
          select: {
            id: true,
            status: true
          }
        }
      },
      take: 20,
    })

    // Transform users to include friendship status
    const transformedUsers = users.map(user => {
      const sentFriendship = user.sentFriendships[0]
      const receivedFriendship = user.receivedFriendships[0]
      const friendship = sentFriendship || receivedFriendship

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        isOnline: user.isOnline,
        lastActive: user.lastActive,
        friendshipStatus: friendship ? friendship.status : 'NONE'
      }
    })

    return NextResponse.json(transformedUsers)
  } catch (error) {
    console.error("[USERS_SEARCH]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 