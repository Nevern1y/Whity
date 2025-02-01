import { Server as ServerIO } from "socket.io"
import { NextApiRequest } from "next"
import { NextApiResponseServerIO } from "@/types/next"
import type { ServerToClientEvents, ClientToServerEvents } from "@/types/socket"

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
}

const ioHandler = async (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (!res.socket.server.io) {
    const io = new ServerIO<ClientToServerEvents, ServerToClientEvents>(res.socket.server as any, {
      path: "/api/socketio",
      addTrailingSlash: false,
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || "*",
        methods: ["GET", "POST"],
        credentials: true,
      },
      pingTimeout: 60000,
      pingInterval: 25000,
      transports: ['websocket', 'polling'],
    })

    io.on("connection", (socket) => {
      console.log("Socket connected:", socket.id)
      
      socket.on("error", (error: Error) => {
        console.error("Socket error:", error)
      })

      socket.on("disconnect", (reason: string) => {
        console.log("Socket disconnected:", socket.id, reason)
      })
    })

    res.socket.server.io = io
  }

  res.end()
}

export default ioHandler 