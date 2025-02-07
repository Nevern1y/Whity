import { NextRequest, NextResponse } from "next/server"
import { Server as ServerIO } from "socket.io"
import { createServer } from "http"

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    // Создаем HTTP сервер
    const httpServer = createServer()
    
    // Инициализируем Socket.IO
    const io = new ServerIO(httpServer, {
      path: "/api/socket.io",
      addTrailingSlash: false,
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      }
    })

    // Обработка подключений
    io.on("connection", (socket) => {
      console.log("Client connected:", socket.id)

      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id)
      })
    })

    // Запускаем сервер на свободном порту
    const port = parseInt(process.env.SOCKET_PORT || "3001")
    httpServer.listen(port)

    return new NextResponse("Socket.IO server is running", { status: 200 })
  } catch (error) {
    console.error("[SOCKET_ERROR]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    // Обработка POST запросов если нужно
    return new NextResponse("OK", { status: 200 })
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 })
  }
}
