import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { FriendsListWrapper } from "./_components/friends-list-wrapper"
import type { FriendshipWithUsers } from "@/types/friends"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UserPlus } from "lucide-react"
import Link from "next/link"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function FriendsPage() {
  try {
    const session = await auth()
    if (!session?.user?.id) redirect("/login")

    const userId = session.user.id

    // Fetch friendships with user data and online status
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            isOnline: true,
            lastActive: true,
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            isOnline: true,
            lastActive: true,
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    // Filter out invalid friendships where either user is missing
    const validFriendships = friendships.filter(friendship => {
      const senderValid = friendship.sender && friendship.sender.id
      const receiverValid = friendship.receiver && friendship.receiver.id
      return senderValid && receiverValid
    }) as FriendshipWithUsers[]

    return (
      <div className="container max-w-5xl py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Друзья</h1>
          <Button asChild>
            <Link href="/search">
              <UserPlus className="h-4 w-4 mr-2" />
              Найти друзей
            </Link>
          </Button>
        </div>

        {validFriendships.length === 0 ? (
          <Card className="p-6">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                У вас пока нет друзей. Добавьте друзей, чтобы начать общение.
              </p>
            </div>
          </Card>
        ) : (
          <FriendsListWrapper friendships={validFriendships} currentUserId={userId} />
        )}
      </div>
    )
  } catch (error) {
    console.error("[FRIENDS_PAGE]", error)
    return (
      <div className="container py-6">
        <Card className="p-6">
          <div className="text-center">
            <p className="text-destructive">
              Произошла ошибка при загрузке списка друзей. Пожалуйста, попробуйте позже.
            </p>
          </div>
        </Card>
      </div>
    )
  }
} 