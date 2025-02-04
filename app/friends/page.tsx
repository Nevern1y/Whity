import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { FriendsList } from "@/app/friends/_components/friends-list"
import { Friendship, User } from "@prisma/client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"

interface FriendshipWithUsers extends Friendship {
  sender: Pick<User, 'id' | 'name' | 'image'> | null
  receiver: Pick<User, 'id' | 'name' | 'image'> | null
}

interface UserIdOnly {
  id: string
}

export default async function FriendsPage() {
  const session = await auth()
  if (!session?.user?.id) return null

  const userId = session.user.id

  // Сначала получаем все существующие ID пользователей
  const existingUserIds = await prisma.user.findMany({
    select: { id: true }
  }).then((users: UserIdOnly[]) => users.map((u: UserIdOnly) => u.id))

  // Получаем все дружеские отношения с проверкой существования пользователей
  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [
        { senderId: userId },
        { receiverId: userId }
      ],
      AND: [
        { sender: { id: { in: existingUserIds } } },
        { receiver: { id: { in: existingUserIds } } }
      ]
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          image: true,
        }
      },
      receiver: {
        select: {
          id: true,
          name: true,
          image: true,
        }
      }
    }
  }) as FriendshipWithUsers[]

  // Разделяем на категории с проверкой существования пользователей
  const acceptedFriends = friendships.filter((f: FriendshipWithUsers) => 
    f.status === 'ACCEPTED' && f.sender && f.receiver
  )

  const incomingRequests = friendships.filter((f: FriendshipWithUsers) => 
    f.status === 'PENDING' && 
    f.receiverId === userId &&
    f.sender
  )

  const outgoingRequests = friendships.filter((f: FriendshipWithUsers) => 
    f.status === 'PENDING' && 
    f.senderId === userId &&
    f.receiver
  )

  return (
    <div className="container py-10">
      <Tabs defaultValue="friends">
        <TabsList>
          <TabsTrigger value="friends">
            Друзья ({acceptedFriends.length})
          </TabsTrigger>
          <TabsTrigger value="incoming">
            Входящие ({incomingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="outgoing">
            Исходящие ({outgoingRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="friends" className="mt-6">
          {acceptedFriends.length > 0 ? (
            <FriendsList 
              friendships={acceptedFriends} 
              currentUserId={userId} 
            />
          ) : (
            <Card className="p-6 text-center text-muted-foreground">
              У вас пока нет друзей
            </Card>
          )}
        </TabsContent>

        <TabsContent value="incoming" className="mt-6">
          {incomingRequests.length > 0 ? (
            <FriendsList 
              friendships={incomingRequests} 
              currentUserId={userId} 
            />
          ) : (
            <Card className="p-6 text-center text-muted-foreground">
              Нет входящих запросов
            </Card>
          )}
        </TabsContent>

        <TabsContent value="outgoing" className="mt-6">
          {outgoingRequests.length > 0 ? (
            <FriendsList 
              friendships={outgoingRequests} 
              currentUserId={userId} 
            />
          ) : (
            <Card className="p-6 text-center text-muted-foreground">
              Нет исходящих запросов
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
} 