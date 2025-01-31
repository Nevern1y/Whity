import { Server as SocketIOServer } from "socket.io"
import { auth } from "@/lib/auth"
import type { 
  ClientToServerEvents, 
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
  SocketIOResponse
} from "@/types/socket"

export const config = {
  api: {
    bodyParser: false,
  },
}

export async function createSocketServer(server: any) {
  const io = new SocketIOServer<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(server, {
    path: '/api/socketio',
    addTrailingSlash: false,
    cors: {
      origin: process.env.NEXTAUTH_URL || '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling']
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

  return io
} 