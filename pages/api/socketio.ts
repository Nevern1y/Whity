import { Server as ServerIO } from "socket.io"
import { NextApiRequest } from "next"
import { NextApiResponseServerIO } from "@/types/next"
import { createServer } from "http"

export const config = {
  api: {
    bodyParser: false,
  },
}

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (!res.socket.server.io) {
    // Создаем HTTP сервер если его еще нет
    const httpServer = res.socket.server as any
    const io = new ServerIO(httpServer, {
      path: "/api/socketio",
      addTrailingSlash: false,
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || "*",
        methods: ["GET", "POST"],
      },
    })

    io.on("connection", (socket) => {
      console.log("Socket connected:", socket.id)
      
      socket.on("disconnect", () => {
        console.log("Socket disconnected:", socket.id)
      })
    })

    res.socket.server.io = io
  }

  res.end()
}

export default ioHandler 