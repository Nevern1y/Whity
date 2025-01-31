import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")?.toLowerCase() || ""

    if (!query) {
      return NextResponse.json([])
    }

    // Используем LIKE для MySQL с нижним регистром
    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            OR: [
              {
                name: {
                  contains: query,
                  not: null,
                }
              },
              {
                email: {
                  contains: query,
                  not: null,
                }
              }
            ]
          },
          {
            id: {
              not: session.user.id
            }
          }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
      take: 10, // Ограничиваем количество результатов
    })

    // Получаем статусы дружбы для найденных пользователей
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { 
            AND: [
              { senderId: session.user.id },
              { receiverId: { in: users.map(u => u.id) } }
            ]
          },
          { 
            AND: [
              { receiverId: session.user.id },
              { senderId: { in: users.map(u => u.id) } }
            ]
          }
        ]
      }
    })

    // Добавляем статус дружбы к каждому пользователю
    const usersWithStatus = users.map(user => {
      const friendship = friendships.find(
        f => f.senderId === user.id || f.receiverId === user.id
      )

      let friendshipStatus: 'NONE' | 'PENDING' | 'ACCEPTED' | 'REJECTED' = 'NONE'

      if (friendship) {
        friendshipStatus = friendship.status as typeof friendshipStatus
      }

      return {
        ...user,
        friendshipStatus,
      }
    })

    return NextResponse.json(usersWithStatus)
  } catch (error) {
    console.error('Search users error:', error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 