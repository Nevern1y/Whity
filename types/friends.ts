import { Friendship, User } from "@prisma/client"

export interface FriendUser {
  id: string
  name: string | null
  email: string | null
  image: string | null
  isOnline: boolean
  lastActive: Date | null
}

export interface FriendshipWithUsers {
  id: string
  senderId: string
  receiverId: string
  status: string
  createdAt: Date
  updatedAt: Date
  sender: FriendUser
  receiver: FriendUser
}

export type FriendshipStatus = 'NONE' | 'PENDING' | 'ACCEPTED' | 'REJECTED' 