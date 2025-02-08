import { io, Socket } from "socket.io-client"
import type { ClientToServerEvents, ServerToClientEvents } from "@/types/socket"

class SocketClient {
  private socket: Socket | null = null
  private isInitialized = false

  getSocket(): Socket {
    if (!this.socket || !this.isInitialized) {
      this.socket = io(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000", {
        path: "/api/socket.io",
        autoConnect: true,
        withCredentials: true,
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      })

      this.socket.on("connect", () => {
        console.log("Socket connected")
        this.isInitialized = true
      })

      this.socket.on("disconnect", () => {
        console.log("Socket disconnected")
        this.isInitialized = false
      })

      this.socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error)
        this.isInitialized = false
      })
    }

    return this.socket
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isInitialized = false
    }
  }

  emit(event: string, data: any): void {
    const socket = this.getSocket()
    socket.emit(event, data)
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