import { Server as NetServer } from "http"
import { NextApiRequest } from "next"
import { Server as ServerIO } from "socket.io"
import { NextApiResponseServerIO } from "@/types/next"
import { auth } from "@/lib/auth"
import type { 
  ClientToServerEvents, 
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
  ServerType
} from "@/types/socket"
import { PrismaClient } from "@prisma/client"
import { ExtendedFriendshipStatus } from "@/lib/constants"
import { getToken } from "next-auth/jwt"

let io: ServerIO | null = null
const prisma = new PrismaClient()

export const config = {
  api: {
    bodyParser: false,
  },
}

export function initSocketServer(req: NextApiRequest, res: NextApiResponseServerIO) {
  if (!res.socket.server.io) {
    const httpServer: NetServer = res.socket.server as any
    const io = new ServerIO(httpServer, {
      path: "/api/socket.io",
      addTrailingSlash: false,
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      },
    })
    
    // Сохраняем io в глобальном объекте
    res.socket.server.io = io

    io.on("connection", (socket) => {
      console.log("Socket connected:", socket.id)

      socket.on("join_user", (userId: string) => {
        socket.join(userId)
        console.log(`User ${userId} joined their room`)
      })

      socket.on("leave_user", (userId: string) => {
        socket.leave(userId)
        console.log(`User ${userId} left their room`)
      })

      socket.on("disconnect", () => {
        console.log("Socket disconnected:", socket.id)
      })
    })
  }
  return res.socket.server.io
}

export function getIO() {
  if (typeof global.io !== 'undefined') {
    return global.io
  }
  return null
}

export function emitSocketEvent(event: string, data: any) {
  const io = getIO()
  if (io) {
    io.emit(event, data)
  }
}

export function initSocketServerOld(server: NetServer) {
  if (!io) {
    io = new ServerIO(server, {
      path: "/api/socket.io",
      addTrailingSlash: false,
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      },
      pingTimeout: 60000,
      pingInterval: 25000,
      connectTimeout: 10000,
      transports: ["websocket", "polling"]
    })

    // Глобальные обработчики ошибок
    io.engine.on("connection_error", (err) => {
      console.error("[Socket] Connection error:", err)
    })

    io.on("connect_error", (err) => {
      console.error("[Socket] Connect error:", err)
    })

    io.on("connection", async (socket) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization
        if (!token) {
          socket.disconnect()
          return
        }

        const decoded = await getToken({ 
          req: {
            headers: {
              authorization: token
            }
          } as any,
          secret: process.env.NEXTAUTH_SECRET!
        })

        if (!decoded?.id) {
          socket.disconnect()
          return
        }

        socket.data.userId = decoded.id
        await socket.join(decoded.id)
        console.log(`User ${decoded.id} connected`)
        
        // Обработчик отмены заявки
        socket.on('cancel_friend_request', async (friendshipId: string) => {
          const friendship = await prisma.friendship.findUnique({
            where: { id: friendshipId }
          })
          
          if (friendship && friendship.senderId === decoded.id && io) {
            await prisma.friendship.delete({
              where: { id: friendshipId }
            })
            
            io.to(friendship.receiverId).emit('friend_request_cancelled', {
              friendshipId,
              senderId: decoded.id
            })

            // Добавляем уведомление об отмене заявки
            await prisma.notification.create({
              data: {
                userId: friendship.receiverId,
                type: 'FRIEND_REQUEST_CANCELLED',
                title: 'Заявка в друзья отменена',
                message: 'Пользователь отменил заявку в друзья',
                link: `/profile/${decoded.id}`
              }
            })
          }
        })

        // Обработчик отключения
        socket.on("disconnect", async () => {
          console.log(`User ${decoded.id} disconnected`)
          
          // При отключении сокета обновляем статус пользователя
          await prisma.user.update({
            where: { id: decoded.id },
            data: { 
              isOnline: false,
              lastActive: new Date()
            }
          })

          // Оповещаем всех о смене статуса
          io?.emit('user_status', { 
            userId: decoded.id, 
            isOnline: false 
          })
        })

        socket.on('friend_request', (data: { 
          targetUserId: string; 
          status: ExtendedFriendshipStatus 
        }) => {
          if (!io) return

          socket.to(data.targetUserId).emit('friend_request', {
            senderId: socket.data.userId!,
            status: data.status
          })
        })

        socket.on('friend_request_response', (data: { 
          senderId: string;
          friendshipId: string;
          status: ExtendedFriendshipStatus 
        }) => {
          if (!io) return

          socket.to(data.senderId).emit('friend_request_response', {
            friendshipId: data.friendshipId,
            status: data.status
          })
        })

        socket.on('get_user_status', async (userId: string) => {
          if (!io) return

          const res = await fetch(`${process.env.NEXTAUTH_URL}/api/users/status?userId=${userId}`)
          const data = await res.json()
          io.emit('user_status', { userId, isOnline: data.isOnline })
        })

      } catch (error) {
        console.error('Socket authentication error:', error)
        socket.disconnect()
      }
    })
  }
  return io
}

export function setIO(socketIO: ServerIO) {
  io = socketIO
} 