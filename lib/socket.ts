import { io, Socket } from "socket.io-client"
import { Server as SocketIOServer } from "socket.io"
import { auth } from "@/lib/auth"
import { toast } from "sonner"
import type { 
  ClientToServerEvents, 
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
  SocketIOResponse,
  ConnectionState
} from "@/types/socket"

class SocketClient {
  private static socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null
  private static connectionState: ConnectionState | null = null
  private static connectionStates = new Map<Socket, ConnectionState>()

  static initialize() {
    if (!this.socket && typeof window !== 'undefined') {
      const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin
      this.socket = io(socketUrl, {
        path: '/api/socketio',
        addTrailingSlash: false,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
      })

      this.setupListeners()
    }
    return this.socket
  }

  private static setupListeners() {
    if (!this.socket) return

    this.socket.on('connect', () => {
      console.log('Socket connected')
      this.connectionState = {
        connected: true,
        messageQueue: [],
        pendingMessages: new Set(),
        lastPing: Date.now(),
        status: 'connected'
      }
    })

    this.socket.on('connect_error', (error: Error) => {
      console.warn('Socket connection error:', error)
      toast.error('Проблемы с подключением к серверу')
    })

    this.socket.on('disconnect', () => {
      if (this.connectionState) {
        this.connectionState.connected = false
      }
    })
  }

  static getSocket() {
    return this.socket || this.initialize()
  }

  static disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.connectionState = null
    }
  }

  static emit<T extends keyof ClientToServerEvents>(
    event: T,
    ...args: Parameters<ClientToServerEvents[T]>
  ): boolean {
    const socket = this.getSocket()
    if (!socket?.connected) {
      console.warn('Socket not connected, queueing message:', event)
      return false
    }

    try {
      socket.emit(event, ...args)
      return true
    } catch (error) {
      console.error('Error emitting event:', error)
      return false
    }
  }

  static getConnectionState() {
    return this.connectionState;
  }
}

export const socketClient = SocketClient

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function SocketHandler(
  req: Request,
  res: SocketIOResponse
) {
  if (!res.socket.server.io) {
    const httpServer = res.socket.server
    const io = new SocketIOServer<
      ClientToServerEvents,
      ServerToClientEvents,
      InterServerEvents,
      SocketData
    >(httpServer, {
      path: "/api/socket",
      addTrailingSlash: false,
      cors: {
        origin: process.env.NEXTAUTH_URL,
        methods: ['GET', 'POST'],
        credentials: true,
      },
    })

    io.on("connection", async (socket) => {
      try {
        const session = await auth()
        if (session?.user?.id) {
          socket.data.userId = session.user.id
          await socket.join(session.user.id)
          console.log(`User ${session.user.id} connected`)
        }
      } catch (error) {
        console.error('Socket authentication error:', error)
        socket.disconnect()
      }
    })

    res.socket.server.io = io
  }

  return new Response(null, { status: 200 })
}

type EmitParameters<T> = T extends (param: infer P) => any ? [P] : []

export function safeSend<T extends keyof ServerToClientEvents>(
  event: T,
  ...args: Parameters<ServerToClientEvents[T]>
): boolean {
  const socket = socketClient.getSocket();
  const state = socketClient.getConnectionState();
  if (!socket?.connected || !state) {
    if (state && args[0] !== undefined) {
      state.messageQueue.push({
        event,
        data: args[0],
        timestamp: Date.now(),
        retries: 0
      })
    }
    return false
  }
  try {
    socket.emit(event as any, ...args)
    if (args[0] !== undefined) {
      state.pendingMessages.add(JSON.stringify({ event, data: args[0] }))
    }
    return true
  } catch (error) {
    console.error('Socket send error:', error)
    if (args[0] !== undefined) {
      state.messageQueue.push({
        event,
        data: args[0],
        timestamp: Date.now(),
        retries: 0
      })
    }
    return false
  }
} 