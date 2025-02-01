import { Server as SocketServer } from "socket.io"
import { NextApiRequest } from "next"
import { NextApiResponse } from "next"
import { Server as NetServer } from "http"

export const config = {
  api: {
    bodyParser: false,
  },
}

const ioHandler = (req: NextApiRequest, res: NextApiResponse) => {
  if (!(res.socket as any).server.io) {
    const httpServer: NetServer = (res.socket as any).server
    const io = new SocketServer(httpServer, {
      path: "/api/socket",
      addTrailingSlash: false,
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL,
        methods: ["GET", "POST"],
        credentials: true,
      },
      transports: ["websocket", "polling"],
    })

    io.on("connection", (socket) => {
      console.log("Socket connected:", socket.id)

      socket.on("disconnect", () => {
        console.log("Socket disconnected:", socket.id)
      })

      socket.on("error", (error) => {
        console.error("Socket error:", error)
      })
    });

    (res.socket as any).server.io = io
  }

  res.end()
}

export default ioHandler 