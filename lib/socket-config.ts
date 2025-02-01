import { type ManagerOptions, type SocketOptions } from "socket.io-client"

// Объединяем типы опций менеджера и сокета
type SocketConfigOptions = Partial<ManagerOptions & SocketOptions>

export const socketConfig: SocketConfigOptions = {
  path: "/api/socketio",
  addTrailingSlash: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  autoConnect: true,
  transports: ["websocket", "polling"],
  withCredentials: true,
} 