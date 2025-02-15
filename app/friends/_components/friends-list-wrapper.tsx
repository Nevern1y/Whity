"use client"

import { FriendsList } from "./friends-list"
import type { FriendshipWithUsers } from "@/types/friends"

interface FriendsListWrapperProps {
  friendships: FriendshipWithUsers[]
  currentUserId: string
}

export function FriendsListWrapper({ friendships, currentUserId }: FriendsListWrapperProps) {
  return (
    <FriendsList 
      friendships={friendships} 
      currentUserId={currentUserId} 
    />
  )
} 