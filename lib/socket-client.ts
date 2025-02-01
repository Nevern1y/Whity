import { io } from "socket.io-client"
import { toast } from "sonner"
import { socketConfig } from "@/lib/socket-config"
import type { 
  ClientSocketType,
  ServerToClientEvents,
  ClientToServerEvents,
  SocketCallback
} from "@/types/socket"

class SocketClient {
  private static socket: ClientSocketType | null = null
  private static reconnectAttempts = 0
  private static maxReconnectAttempts = 5

  static initialize() {
    if (!this.socket && typeof window !== 'undefined') {
      const socketUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
      
      this.socket = io(socketUrl, socketConfig) as ClientSocketType

      this.setupListeners()
    }
    return this.socket
  }

  private static setupListeners() {
    if (!this.socket) return

    this.socket.on('connect', () => {
      console.log('Socket connected successfully')
      this.reconnectAttempts = 0
    })

    this.socket.on('connect_error', (error: Error) => {
      console.warn('Socket connection error:', error)
      this.reconnectAttempts++
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached')
        this.socket?.close()
      }
    })

    this.socket.on('disconnect', (reason: string) => {
      console.log('Socket disconnected:', reason)
      if (reason === 'io server disconnect') {
        this.socket?.connect()
      }
    })

    this.socket.on('error', (error: Error) => {
      console.error('Socket error:', error)
    })
  }

  static getSocket() {
    if (!this.socket) {
      this.initialize()
    }
    return this.socket
  }

  static disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
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