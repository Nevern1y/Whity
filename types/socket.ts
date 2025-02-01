import { Server as NetServer } from "http"
import { NextApiResponse } from "next"
import { Server as ServerIO } from "socket.io"
import { Socket } from "socket.io-client"
import { Server } from "socket.io"

export interface ChatMessage {
  id: string
  content: string
  senderId: string
  createdAt: string
  sender: {
    id: string
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
  new_message: (message: ChatMessage) => void
  error: (error: Error) => void
  connect: () => void
  disconnect: () => void
  connect_error: (error: Error) => void
  "notification:new": (notification: FullNotification) => void
}

export interface ClientToServerEvents {
  join_chat: (userId: string) => void
  leave_chat: (userId: string) => void
  send_message: (message: { receiverId: string; content: string }) => void
}

export interface InterServerEvents {
  // Определите события между серверами здесь
}

export interface SocketData {
  userId: string
  // Определите пользовательские данные сокета здесь
}

export type ClientSocketType = Socket<ServerToClientEvents, ClientToServerEvents>

export type SocketCallback<T extends keyof ServerToClientEvents> = Parameters<ServerToClientEvents[T]>[0]

export type NextApiResponseServerIO = NextApiResponse & {
  socket: any & {
    server: NetServer & {
      io: Server<ClientToServerEvents, ServerToClientEvents>
    }
  }
}

export type SocketIOResponse = NextApiResponseServerIO 