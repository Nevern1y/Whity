"use client"

import { Button } from "@/components/ui/button"
import { Users } from "lucide-react"
import Link from "next/link"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useEffect, useState } from "react"
import { useSocket } from "@/components/providers/socket-provider"
import { SOCKET_EVENTS } from "@/components/providers/socket-provider"
import { toast } from "sonner"

export function FriendsButton() {
  const { socket, isConnected } = useSocket()
  const [pendingRequests, setPendingRequests] = useState(0)

  useEffect(() => {
    // Если сокет не подключен, выходим
    if (!socket || !isConnected) return

    const handleFriendRequest = (data: any) => {
      setPendingRequests(prev => prev + 1)
      toast.info('Получен новый запрос в друзья')
    }

    const handleFriendRequestResponse = (data: any) => {
      if (data.status === 'ACCEPTED') {
        toast.success('Запрос в друзья принят')
      } else if (data.status === 'REJECTED') {
        toast.error('Запрос в друзья отклонен')
      }
    }

    const syncFriendRequests = async () => {
      try {
        const response = await fetch('/api/friends/sync')
        const data = await response.json()
        // Обновляем количество ожидающих запросов
        const pending = data.filter((f: any) => 
          f.status === 'PENDING'
        ).length
        setPendingRequests(pending)
      } catch (error) {
        console.error('Failed to sync friend requests:', error)
      }
    }

    // Подписываемся на события
    socket.on(SOCKET_EVENTS.FRIEND_REQUEST, handleFriendRequest)
    socket.on(SOCKET_EVENTS.FRIEND_REQUEST_RESPONSE, handleFriendRequestResponse)

    // Синхронизируем при подключении
    syncFriendRequests()

    // Синхронизируем каждые 5 минут
    const interval = setInterval(syncFriendRequests, 5 * 60 * 1000)

    return () => {
      socket.off(SOCKET_EVENTS.FRIEND_REQUEST, handleFriendRequest)
      socket.off(SOCKET_EVENTS.FRIEND_REQUEST_RESPONSE, handleFriendRequestResponse)
      clearInterval(interval)
    }
  }, [socket, isConnected])

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Link href="/friends" className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
            >
              <Users className="h-5 w-5" />
            </Button>
            {pendingRequests > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 text-xs flex items-center justify-center bg-red-500 text-white rounded-full">
                {pendingRequests}
              </span>
            )}
          </Link>
        </TooltipTrigger>
        <TooltipContent>
          <p>Друзья</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
} 