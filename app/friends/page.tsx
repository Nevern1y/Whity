import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { FriendsList } from "@/app/friends/_components/friends-list"
import { FriendshipWithUsers } from "@/types/friends"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"

export default async function FriendsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const userId = session.user.id

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
        }
      },
      receiver: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        }
      }
    }
  }) as FriendshipWithUsers[]

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Друзья</h1>
      {friendships.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">У вас пока нет друзей</p>
        </div>
      ) : (
        <FriendsList friendships={friendships} currentUserId={userId} />
      )}
    </div>
  )
} 