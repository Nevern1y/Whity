import { Server as NetServer } from "http"
import { NextApiResponse } from "next"
import { Server as SocketIOServer } from "socket.io"
import { Socket } from "socket.io-client"
import type { Socket as NetSocket } from "net"
import { ExtendedFriendshipStatus } from "@/lib/constants"

export interface ChatMessage {
  id: string
  content: string
  senderId: string
  createdAt: string | Date
  sender: {
    name: string | null
    image: string | null
  }
}

export interface FullNotification {
  id: string
  title: string
  message: string
  type: string
  read: boolean
  createdAt: Date
  userId: string
}

export interface ConnectionState {
  connected: boolean
  messageQueue: any[]
  pendingMessages: Set<unknown>
  lastPing: number
  status: 'connected' | 'disconnected' | 'connecting' | 'error'
}

export interface ServerToClientEvents {
  error: (error: string) => void
  new_message: (message: ChatMessage) => void
  "notification:new": (notification: any) => void
  friend_request: (data: { senderId: string; status: ExtendedFriendshipStatus }) => void
  friend_request_response: (data: { friendshipId: string; status: ExtendedFriendshipStatus }) => void
  friend_request_cancelled: (data: { friendshipId: string; senderId: string }) => void
  friendship_update: (data: any) => void
  user_status: (data: { userId: string; isOnline: boolean }) => void
}

export interface ClientToServerEvents {
  friend_request: (data: { targetUserId: string; status: ExtendedFriendshipStatus }) => void
  friend_request_response: (data: { senderId: string; friendshipId: string; status: ExtendedFriendshipStatus }) => void
  cancel_friend_request: (friendshipId: string) => void
  join_chat: (chatId: string) => void
  leave_chat: (chatId: string) => void
  send_message: (message: any) => void
  join_user: (userId: string) => void
  leave_user: (userId: string) => void
  get_user_status: (userId: string) => void
}

export interface InterServerEvents {
  ping: () => void
}

export interface SocketData {
  userId: string
}

export type ServerType = SocketIOServer<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>

export type ClientSocket = Socket<ServerToClientEvents, ClientToServerEvents>

export interface SocketServer extends NetServer {
  io?: ServerType
}

export interface ResponseSocket {
  server: SocketServer
}

export type NextApiResponseServerIO = NextApiResponse & {
  socket: ResponseSocket
}

export type SocketIOResponse = NextApiResponseServerIO 