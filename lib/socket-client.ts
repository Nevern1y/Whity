import { io, Socket } from "socket.io-client"
import type { ClientToServerEvents, ServerToClientEvents } from "@/types/socket"

class SocketClient {
  private socket: Socket | null = null
  private static instance: SocketClient

  private constructor() {}

  static getInstance(): SocketClient {
    if (!SocketClient.instance) {
      SocketClient.instance = new SocketClient()
    }
    return SocketClient.instance
  }

  connect() {
    if (!this.socket) {
      this.socket = io({
        path: "/api/socket.io",
        addTrailingSlash: false,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        autoConnect: false,
        transports: ['websocket', 'polling']
      })

      this.socket.on("connect", () => {
        console.log("[Socket] Connected:", this.socket?.id)
      })

      this.socket.on("connect_error", (error) => {
        console.error("[Socket] Connection error:", error.message)
      })

      this.socket.connect()
    }
    return this.socket
  }

  getSocket() {
    return this.socket || this.connect()
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  emit<T extends keyof ClientToServerEvents>(
    event: T,
    ...args: Parameters<ClientToServerEvents[T]>
  ) {
    this.socket?.emit(event, ...args)
  }

  on<T extends keyof ServerToClientEvents>(
    event: T,
    listener: ServerToClientEvents[T]
  ) {
    this.socket?.on(event, listener as any)
  }

  off<T extends keyof ServerToClientEvents>(
    event: T,
    listener: ServerToClientEvents[T]
  ) {
    this.socket?.off(event, listener as any)
  }
}

export const socketClient = SocketClient.getInstance() 