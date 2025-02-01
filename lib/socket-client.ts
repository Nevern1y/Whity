import { io, Socket } from "socket.io-client"
import type { 
  ClientSocketType,
  ServerToClientEvents,
  ClientToServerEvents
} from "@/types/socket"
import { socketConfig } from "./socket-config"

class SocketClient {
  private static instance: SocketClient
  private socket: Socket | null = null

  private constructor() {
    const SOCKET_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    
    this.socket = io(SOCKET_URL, socketConfig)

    this.setupListeners()
  }

  private setupListeners() {
    if (!this.socket) return

    this.socket.on("connect", () => {
      console.log("Socket connected:", this.socket?.id)
    })

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message)
    })

    this.socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason)
      if (reason === "io server disconnect") {
        this.socket?.connect()
      }
    })

    this.socket.on("error", (error) => {
      console.error("Socket error:", error)
    })
  }

  public static getInstance(): SocketClient {
    if (!SocketClient.instance) {
      SocketClient.instance = new SocketClient()
    }
    return SocketClient.instance
  }

  public getSocket() {
    return this.socket
  }

  public connect() {
    this.socket?.connect()
  }

  public disconnect() {
    this.socket?.disconnect()
  }

  public on<T extends keyof ServerToClientEvents>(
    event: T,
    callback: (data: Parameters<ServerToClientEvents[T]>[0]) => void
  ) {
    this.socket?.on(event, callback as any)
  }

  public off<T extends keyof ServerToClientEvents>(
    event: T,
    callback: (data: Parameters<ServerToClientEvents[T]>[0]) => void
  ) {
    this.socket?.off(event, callback as any)
  }

  public emit<T extends keyof ClientToServerEvents>(
    event: T,
    ...args: Parameters<ClientToServerEvents[T]>
  ) {
    if (!this.socket?.connected) return false
    try {
      this.socket.emit(event, ...args)
      return true
    } catch (error) {
      console.error('Error emitting event:', error)
      return false
    }
  }
}

const socketClient = SocketClient.getInstance()
export { socketClient } 