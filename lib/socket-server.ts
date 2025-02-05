import { Server as NetServer } from "http"
import { Server as SocketIOServer } from "socket.io"
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

let io: ServerType | null = null
const prisma = new PrismaClient()

export const initSocketServer = (httpServer: NetServer): ServerType => {
  if (!io) {
    io = new SocketIOServer(httpServer, {
      path: '/api/socket.io',
      addTrailingSlash: false,
      cors: {
        origin: process.env.NEXTAUTH_URL || '*',
        methods: ['GET', 'POST'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
      allowEIO3: true
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

export const getIO = () => io

export const setIO = (socketIO: ServerType) => {
  io = socketIO
}

export const config = {
  api: {
    bodyParser: false,
  },
} 