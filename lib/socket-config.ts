import { type ManagerOptions, type SocketOptions } from "socket.io-client"

// Объединяем типы опций менеджера и сокета
type SocketConfigOptions = Partial<ManagerOptions & SocketOptions>

export const socketConfig = {
  path: "/api/socket.io",
  addTrailingSlash: false,
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 2000,
  reconnectionDelayMax: 10000,
  timeout: 20000,
  autoConnect: true,
  withCredentials: true,
  forceNew: false,
  multiplex: true,
  pingInterval: 25000,
  pingTimeout: 20000,
  upgrade: true,
  rememberUpgrade: true
} 