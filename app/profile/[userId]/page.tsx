import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Friendship, User } from "@prisma/client"

type FriendshipWithUser = Friendship & {
  receiver?: User | null
  sender?: User | null
}

export default async function ProfilePage({ params }: { params: { userId: string } }) {
  const session = await auth()
  const currentUserId = session?.user?.id

  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    include: {
      friendshipsAsSender: {
        where: { 
          status: 'ACCEPTED',
          receiver: { id: { not: null } }
        },
        include: { receiver: true }
      },
      friendshipsAsReceiver: {
        where: { 
          status: 'ACCEPTED',
          sender: { id: { not: null } }
        },
        include: { sender: true }
      }
    }
  })

  if (!user) {
    notFound()
  }

  const friendsCount = 
    user.friendshipsAsSender.filter((f: FriendshipWithUser) => f.receiver).length + 
    user.friendshipsAsReceiver.filter((f: FriendshipWithUser) => f.sender).length

  return (
    <div>
      <div>
        Друзей: {friendsCount}
      </div>
    </div>
  )
} 