import { io, Socket } from "socket.io-client"
import type { ClientToServerEvents, ServerToClientEvents } from "@/types/socket"

class SocketClient {
  private socket: Socket | null = null
  private isInitialized = false
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private messageQueue: { event: string; data: any }[] = []
  private batchTimeout: NodeJS.Timeout | null = null
  private readonly BATCH_DELAY = 100 // ms

  getSocket(): Socket {
    if (!this.socket || !this.isInitialized) {
      this.socket = io(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000", {
        path: "/api/socket.io",
        autoConnect: true,
        withCredentials: true,
        transports: ['websocket'],
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        timeout: 10000,
      })

      this.setupSocketHandlers()
    }

    return this.socket
  }

  private setupSocketHandlers() {
    if (!this.socket) return

    this.socket.on("connect", () => {
      console.log("Socket connected")
      this.isInitialized = true
      this.reconnectAttempts = 0
      this.flushMessageQueue()
    })

    this.socket.on("disconnect", () => {
      console.log("Socket disconnected")
      this.isInitialized = false
    })

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error)
      this.isInitialized = false
      this.reconnectAttempts++

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        this.socket?.disconnect()
        console.error("Max reconnection attempts reached")
      }
    })

    // Add ping/pong for connection health check
    this.socket.on("ping", () => {
      this.socket?.emit("pong")
    })
  }

  disconnect() {
    if (this.socket) {
      this.clearMessageQueue()
      this.socket.disconnect()
      this.socket = null
      this.isInitialized = false
    }
  }

  private clearMessageQueue() {
    this.messageQueue = []
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout)
      this.batchTimeout = null
    }
  }

  private flushMessageQueue() {
    if (!this.socket || !this.isInitialized || this.messageQueue.length === 0) return

    const batch = this.messageQueue.splice(0)
    this.socket.emit("batch", batch)
  }

  emit(event: string, data: any): void {
    if (!this.socket || !this.isInitialized) {
      this.messageQueue.push({ event, data })
      return
    }

    this.messageQueue.push({ event, data })

    if (!this.batchTimeout) {
      this.batchTimeout = setTimeout(() => {
        this.flushMessageQueue()
        this.batchTimeout = null
      }, this.BATCH_DELAY)
    }
  }

  on(event: string, callback: (data: any) => void): () => void {
    const socket = this.getSocket()
    socket.on(event, callback)
    return () => socket.off(event, callback)
  }

  // Typed event handlers
  onMessage(callback: (data: any) => void): () => void {
    return this.on("message", callback)
  }

  onUserStatus(callback: (data: { userId: string; isOnline: boolean }) => void): () => void {
    return this.on("user_status", callback)
  }

  onTyping(callback: (data: { userId: string; isTyping: boolean }) => void): () => void {
    return this.on("typing", callback)
  }

  // Add dashboard event handlers
  onDashboardStats(callback: (data: any) => void): () => void {
    const socket = this.getSocket()
    socket.on("dashboard_stats", callback)
    return () => socket.off("dashboard_stats", callback)
  }

  onDashboardUpdate(callback: (data: any) => void): () => void {
    const socket = this.getSocket()
    socket.on("dashboard_update", callback)
    return () => socket.off("dashboard_update", callback)
  }

  joinDashboard(userId: string): void {
    this.emit("join_dashboard", userId)
  }

  leaveDashboard(userId: string): void {
    this.emit("leave_dashboard", userId)
  }
}

export const socketClient = new SocketClient() 