"use client"

import { createContext, useContext, useEffect, PropsWithChildren } from "react"
import { io, Socket } from "socket.io-client"
import { useFriendSocket } from "@/hooks/use-friend-socket"
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

// Определяем константы как объект с типизированными значениями
export const SOCKET_EVENTS = {
  FRIEND_REQUEST: 'friend_request',
  FRIEND_REQUEST_RESPONSE: 'friend_request_response',
  FRIEND_REQUEST_CANCELLED: 'friend_request_cancelled',
  FRIENDSHIP_UPDATE: 'friendship_update',
  NEW_MESSAGE: 'new_message',
  NOTIFICATION: 'notification:new',
  JOIN_CHAT: 'join_chat',
  LEAVE_CHAT: 'leave_chat',
  JOIN_USER: 'join_user',
  LEAVE_USER: 'leave_user',
  CONNECT: 'connect',
  CONNECT_ERROR: 'connect_error',
  DISCONNECT: 'disconnect',
  ERROR: 'error'
} as const;

type SocketContextType = {
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false
});

export function SocketProvider({ children }: PropsWithChildren) {
  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000", {
      path: "/api/socket",
    })

    return () => {
      socket.close()
    }
  }, [])

  // Используем хук для функциональности друзей
  useFriendSocket()

  return (
    <SocketContext.Provider value={{ socket: null, isConnected: false }}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider")
  }
  return context.socket
} 