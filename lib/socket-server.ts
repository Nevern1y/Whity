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
import { FriendshipStatus } from "@prisma/client"

let io: ServerType | null = null
const prisma = new PrismaClient()

export const initSocketServer = (httpServer: NetServer): ServerType => {
  if (!io) {
    io = new SocketIOServer<
      ClientToServerEvents,
      ServerToClientEvents,
      InterServerEvents,
      SocketData
    >(httpServer, {
      path: '/api/socket.io',
      addTrailingSlash: false,
      cors: {
        origin: process.env.NEXTAUTH_URL || '*',
        methods: ['GET', 'POST'],
        credentials: true,
      }
    })

    io.on("connection", async (socket) => {
      try {
        const session = await auth()
        const userId = session?.user?.id

        if (!userId) {
          socket.disconnect()
          return
        }

        socket.data.userId = userId
        await socket.join(userId)
        console.log(`User ${userId} connected`)
        
        // Обработчик отмены заявки
        socket.on('cancel_friend_request', async (friendshipId: string) => {
          const friendship = await prisma.friendship.findUnique({
            where: { id: friendshipId }
          })
          
          if (friendship && friendship.senderId === userId && io) {
            await prisma.friendship.delete({
              where: { id: friendshipId }
            })
            
            io.to(friendship.receiverId).emit('friend_request_cancelled', {
              friendshipId,
              senderId: userId
            })

            // Добавляем уведомление об отмене заявки
            await prisma.notification.create({
              data: {
                userId: friendship.receiverId,
                type: 'FRIEND_REQUEST_CANCELLED',
                title: 'Заявка в друзья отменена',
                message: 'Пользователь отменил заявку в друзья',
                link: `/profile/${userId}`
              }
            })
          }
        })

        // Обработчик отключения
        socket.on("disconnect", () => {
          console.log(`User ${userId} disconnected`)
        })

        socket.on('friend_request', (data: { targetUserId: string; status: FriendshipStatus }) => {
          socket.to(data.targetUserId).emit('friend_request', {
            senderId: socket.data.userId!,
            status: data.status
          })
        })

        socket.on('friend_request_response', (data: { 
          senderId: string;
          friendshipId: string;
          status: FriendshipStatus 
        }) => {
          socket.to(data.senderId).emit('friend_request_response', {
            friendshipId: data.friendshipId,
            status: data.status
          })
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