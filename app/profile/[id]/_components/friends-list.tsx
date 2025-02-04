"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FriendshipStatusBadge } from "@/components/friendship-status-badge"
import Link from "next/link"

interface Friend {
  id: string
  name: string | null
  image: string | null
  email: string | null
}

interface Friendship {
  id: string
  sender: Friend
  receiver: Friend
  status: string
}

interface FriendsListProps {
  sentFriendships: Friendship[]
  receivedFriendships: Friendship[]
}

export function FriendsList({ sentFriendships, receivedFriendships }: FriendsListProps) {
  const allFriendships = [...sentFriendships, ...receivedFriendships]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {allFriendships.map((friendship) => {
        const friend = friendship.sender.id === friendship.receiver.id 
          ? friendship.receiver 
          : friendship.sender

        return (
          <Card key={friendship.id}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={friend.image || undefined} />
                  <AvatarFallback>
                    {friend.name?.[0] || friend.email?.[0] || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <Link 
                    href={`/profile/${friend.id}`}
                    className="font-medium hover:underline truncate block"
                  >
                    {friend.name || friend.email}
                  </Link>
                  <FriendshipStatusBadge 
                    status={friendship.status as any}
                    isIncoming={friendship.receiver.id === friend.id}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
} 