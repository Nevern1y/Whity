import { io } from "socket.io-client"
import { toast } from "sonner"
import type { 
  ClientSocketType,
  ServerToClientEvents,
  ClientToServerEvents,
  SocketCallback
} from "@/types/socket"

class SocketClient {
  private static socket: ClientSocketType | null = null

  static initialize() {
    if (!this.socket && typeof window !== 'undefined') {
      const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin
      this.socket = io(socketUrl, {
        path: '/api/socketio',
        autoConnect: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 20000,
        transports: ['websocket', 'polling']
      }) as ClientSocketType

      this.setupListeners()
    }
    return this.socket
  }

  private static setupListeners() {
    if (!this.socket) return

    this.socket.on('connect', () => {
      console.log('Socket connected')
    })

    this.socket.on('connect_error', (error: Error) => {
      console.warn('Socket connection error:', error)
      toast.error('Проблемы с подключением к серверу')
    })
  }

  static getSocket() {
    return this.socket || this.initialize()
  }

  static on<T extends keyof ServerToClientEvents>(
    event: T,
    callback: SocketCallback<T>
  ) {
    const socket = this.getSocket()
    if (socket) {
      socket.on(event, callback as any) // type assertion необходим из-за ограничений Socket.IO
    }
  }

  static off<T extends keyof ServerToClientEvents>(
    event: T,
    callback: SocketCallback<T>
  ) {
    const socket = this.getSocket()
    if (socket) {
      socket.off(event, callback as any)
    }
  }

  static emit<T extends keyof ClientToServerEvents>(
    event: T,
    ...args: Parameters<ClientToServerEvents[T]>
  ): boolean {
    const socket = this.getSocket()
    if (!socket?.connected) return false

    try {
      socket.emit(event, ...args)
      return true
    } catch (error) {
      console.error('Error emitting event:', error)
      return false
    }
  }
}

export const socketClient = SocketClient 