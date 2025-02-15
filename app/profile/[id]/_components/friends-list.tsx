"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { UserAvatar } from "@/components/user-avatar"
import Link from "next/link"
import { cn } from "@/lib/utils"
import type { FriendshipWithUsers } from "@/types/friends"

interface FriendsListProps {
  allFriendships: FriendshipWithUsers[]
}

export function FriendsList({ allFriendships }: FriendsListProps) {
  // Filter out invalid friendships
  const validFriendships = allFriendships.filter(friendship => 
    friendship.sender && 
    friendship.receiver && 
    friendship.sender.id && 
    friendship.receiver.id
  )

  if (validFriendships.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">Нет друзей</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {validFriendships.map((friendship) => {
        const friend = friendship.sender.id === friendship.receiver.id 
          ? friendship.receiver 
          : friendship.sender

        return (
          <Card key={friendship.id} className="overflow-hidden">
            <CardContent className="p-4">
              <Link 
                href={`/profile/${friend.id}`}
                className="flex items-center gap-4"
              >
                <UserAvatar 
                  user={friend}
                  className="h-12 w-12"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {friend.name || friend.email}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {friend.email}
                  </p>
                </div>
              </Link>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
} 