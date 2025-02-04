import { io, Socket } from "socket.io-client"
import type { ClientToServerEvents, ServerToClientEvents } from "@/types/socket"

class SocketClient {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null
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
        path: '/api/socket.io',
        addTrailingSlash: false,
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      })

      this.socket.on('connect', () => {
        console.log('Socket connected:', this.socket?.id)
      })

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error)
      })
    }
    return this.socket
  }

  getSocket() {
    if (!this.socket) {
      return this.connect()
    }
    return this.socket
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