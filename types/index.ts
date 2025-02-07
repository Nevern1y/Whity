export interface Message {
  id: string
  content: string
  createdAt: string
  senderId: string
  sender: {
    id: string
    name: string | null
    image: string | null
  }
}

export type NotificationType = 'course' | 'achievement' | 'message' | 'news' | 'friend_request'

export interface Notification {
  id: string
  title: string
  message: string
  type: NotificationType
  read: boolean
  createdAt: Date
  link?: string
}

export interface User {
  id: string
  name: string | null
  email: string | null
  image: string | null
  friendshipStatus: 'NONE' | 'PENDING' | 'ACCEPTED' | 'REJECTED'
  isOnline: boolean
  isIncoming?: boolean
  sentFriendships?: FriendshipData[]
  receivedFriendships?: FriendshipData[]
}

export interface FriendshipData {
  id: string
  status: 'NONE' | 'PENDING' | 'ACCEPTED' | 'REJECTED'
} 