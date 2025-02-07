"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { io, Socket } from "socket.io-client"
import { useSession } from "next-auth/react"
import { ClientToServerEvents, ServerToClientEvents } from "@/types/socket"

// Определяем тип для событий сокета
export type SocketEventType = 
  | 'friend_request'
  | 'friend_request_response'
  | 'friend_request_cancelled'
  | 'friendship_update'
  | 'new_message'
  | 'notification:new'
  | 'connect'
  | 'connect_error'
  | 'disconnect'
  | 'error';

interface SocketContextType {
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null
  isConnected: boolean
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false
})

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const { data: session } = useSession()

  useEffect(() => {
    if (!session?.user?.id || socket) return

    const socketInstance = io(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000", {
      path: "/api/socket.io",
      addTrailingSlash: false,
      auth: {
        userId: session.user.id
      },
      transports: ['websocket', 'polling']
    })

    socketInstance.on('connect', () => {
      console.log('Socket connected')
      setIsConnected(true)
    })

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected')
      setIsConnected(false)
    })

    setSocket(socketInstance)

    return () => {
      if (socketInstance) {
        socketInstance.disconnect()
      }
    }
  }, [session?.user?.id, socket])

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider")
  }
  return context
}

export const SOCKET_EVENTS = {
  FRIEND_REQUEST: 'friend_request',
  FRIEND_REQUEST_RESPONSE: 'friend_request_response',
  FRIEND_REQUEST_CANCELLED: 'friend_request_cancelled',
  FRIENDSHIP_UPDATE: 'friendship_update',
  NEW_MESSAGE: 'new_message',
  NOTIFICATION: 'notification:new'
} as const 