import { type ManagerOptions, type SocketOptions } from "socket.io-client"

// Объединяем типы опций менеджера и сокета
type SocketConfigOptions = Partial<ManagerOptions & SocketOptions>

export const socketConfig = {
  path: "/api/socket",
  addTrailingSlash: false,
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  autoConnect: false,
  withCredentials: true,
} 