import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
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
    const usersWithFriendshipStatus = users.map(user => {
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