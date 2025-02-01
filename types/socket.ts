import { Socket } from "socket.io-client"

export interface ServerToClientEvents {
  notification: (data: NotificationData) => void
  "connect_error": (error: Error) => void
  "disconnect": (reason: string) => void
  "error": (error: Error) => void
}

export interface ClientToServerEvents {
  // Определите здесь события, которые клиент отправляет на сервер
}

export type ClientSocketType = Socket<ServerToClientEvents, ClientToServerEvents>

export type SocketCallback<T extends keyof ServerToClientEvents> = Parameters<ServerToClientEvents[T]>[0]

interface NotificationData {
  // Определите структуру данных уведомления
  id: string
  message: string
  type: 'info' | 'success' | 'error' | 'warning'
  // ... другие поля
} 