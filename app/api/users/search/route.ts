import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

interface User {
  id: string
  name: string | null
  email: string | null
  image: string | null
  role: string
  createdAt: Date
}

interface Friendship {
  id: string
  senderId: string
  receiverId: string
  status: string
}

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")
    const role = searchParams.get("role")
    const status = searchParams.get("status")

    if (!query) {
      return NextResponse.json([])
    }

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { email: { contains: query } }
        ],
        NOT: {
          id: userId
        },
        ...(role && { role })
      },
      include: {
        sentFriendships: {
          where: {
            OR: [
              { receiverId: userId },
              { senderId: userId }
            ]
          }
        },
        receivedFriendships: {
          where: {
            OR: [
              { receiverId: userId },
              { senderId: userId }
            ]
          }
        }
      }
    }) as (User & { sentFriendships: Friendship[], receivedFriendships: Friendship[] })[]

    // Фильтруем по статусу дружбы, если указан
    const filteredUsers = users.filter((u: User & { sentFriendships: Friendship[], receivedFriendships: Friendship[] }) => {
      if (!status) return true
      const friendships = [...u.sentFriendships, ...u.receivedFriendships]
      return friendships.some((f: Friendship) => f.status === status)
    })

    // Форматируем ответ
    const formattedUsers = filteredUsers.map((u: User & { sentFriendships: Friendship[], receivedFriendships: Friendship[] }) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      image: u.image,
      role: u.role,
      createdAt: u.createdAt
    }))

    // Сортируем результаты
    const sortedUsers = formattedUsers.sort((user: User) => {
      const friendships = [
        ...users.find(u => u.id === user.id)?.sentFriendships || [], 
        ...users.find(u => u.id === user.id)?.receivedFriendships || []
      ]
      
      const friendship = friendships.find((f: Friendship) => 
        f.senderId === userId || f.receiverId === userId
      )
      
      return friendship?.status === 'ACCEPTED' ? -1 : 1
    })

    return NextResponse.json(sortedUsers)
  } catch (error) {
    console.error("[USERS_SEARCH]", error)
    return NextResponse.json({ error: "Failed to search users" }, { status: 500 })
  }
} 