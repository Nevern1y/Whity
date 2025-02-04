"use client"

import { useFriendSocket } from "@/hooks/use-friend-socket"
import { createContext, useContext } from "react"
import { Socket } from "socket.io-client"
import { ClientToServerEvents, ServerToClientEvents } from "@/types/socket"

type SocketContextType = {
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
  isConnected: boolean;
}

export const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false
});

export const useSocket = () => {
  return useContext(SocketContext).socket;
};

// Определяем тип для событий сокета
export type SocketEventType = 
  | 'friend_request'
  | 'friend_request_response'
  | 'friend_request_cancelled'
  | 'friendship_update'  // Добавляем новый тип
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

export function SocketProvider() {
  useFriendSocket()
  return null
} 