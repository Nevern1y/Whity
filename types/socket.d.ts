import { Socket as ClientSocket } from "socket.io-client"
import { Socket as ServerSocket, Server as SocketServer } from "socket.io"
import { Server as NetServer } from "http"

// Базовые типы сообщений
export interface BaseMessage {
  id: string
  content: string
  senderId: string
  receiverId: string
}

export interface ChatMessage extends BaseMessage {
  createdAt: string
  sender: {
    id: string
    name: string | null
    image: string | null
  }
}

export interface BaseNotification {
  id: string
  title: string
  message: string
  type: string
}

export interface FullNotification extends BaseNotification {
  read: boolean
  createdAt: Date
  userId: string
}

// Типы для управления состоянием
export interface QueuedMessage {
  event: string
  data: any
  timestamp: number
  retries: number
}

export interface ConnectionState {
  connected: boolean
  messageQueue: QueuedMessage[]
  pendingMessages: Set<string>
  lastPing: number
}

// События сокетов
export type SocketEventName = 
  | 'new_message'
  | 'notification'
  | 'notification:new'
  | 'notification:update'
  | 'notification:updated'
  | 'connect'
  | 'disconnect'
  | 'connect_error'

// События
export interface ServerToClientEvents {
  'new_message': (message: ChatMessage) => void
  'notification': (notification: FullNotification) => void
  'notification:new': (notification: FullNotification) => void
  'notification:update': (notification: FullNotification) => void
  'notification:updated': (notification: Pick<FullNotification, 'id' | 'read'>) => void
}

export interface ClientToServerEvents {
  'join_chat': (chatId: string) => void
  'leave_chat': (chatId: string) => void
  'send_message': (message: Omit<BaseMessage, 'id'> & { sender: ChatMessage['sender'] }) => void
  'notification:read': (notificationId: string) => void
}

export interface InterServerEvents {
  ping: () => void
}

export interface SocketData {
  userId: string
  connectionTime: Date
}

// Типы сокетов
export type ClientSocketType = ClientSocket<ServerToClientEvents, ClientToServerEvents>
export type ServerSocketType = ServerSocket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>
export type SocketServerType = SocketServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>

// Тип для callback-функций
export type SocketCallback<T extends keyof ServerToClientEvents> = (
  ...args: Parameters<ServerToClientEvents[T]>
) => void

// Типы для Next.js
export interface SocketIOResponse extends Response {
  socket: {
    server: NetServer & {
      io: SocketServerType
    }
  }
}

declare global {
  var io: SocketServerType | undefined
} 