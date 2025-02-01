import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

interface User {
  id: string
  name: string | null
  email: string | null
  image: string | null
  sentFriendships: { status: string }[]
  receivedFriendships: { status: string }[]
}

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const users = await prisma.user.findMany({
      where: {
        NOT: {
          id: session.user.id
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        sentFriendships: {
          where: {
            receiverId: session.user.id
          },
          select: {
            status: true
          }
        },
        receivedFriendships: {
          where: {
            senderId: session.user.id
          },
          select: {
            status: true
          }
        }
      }
    })

    // Преобразуем данные, добавляя статус дружбы
    const usersWithFriendshipStatus = users.map((user: User) => {
      const sentFriendship = user.sentFriendships[0]
      const receivedFriendship = user.receivedFriendships[0]
      const friendshipStatus = (sentFriendship?.status || receivedFriendship?.status || 'NONE') as 'NONE' | 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'SELF'

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        friendshipStatus
      }
    })

    return NextResponse.json(usersWithFriendshipStatus)
  } catch (error) {
    console.error("[USERS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 