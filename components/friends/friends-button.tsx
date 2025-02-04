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
import { useEffect, useState, useCallback } from "react"
import { useSocket, SOCKET_EVENTS } from "@/components/providers/socket-provider"

export function FriendsButton() {
  const [pendingCount, setPendingCount] = useState(0)
  const socket = useSocket()

  const syncFriendships = useCallback(async () => {
    try {
      const res = await fetch('/api/friends/sync')
      if (!res.ok) throw new Error('Failed to sync')
      const data = await res.json()
      setPendingCount(data.pendingCount)
    } catch (error) {
      console.error('Failed to sync friendships:', error)
    }
  }, [])

  useEffect(() => {
    syncFriendships()

    if (!socket) return

    const handleFriendRequest = () => {
      syncFriendships()
    }

    const handleFriendRequestResponse = () => {
      syncFriendships()
    }

    socket.on(SOCKET_EVENTS.FRIEND_REQUEST, handleFriendRequest)
    socket.on(SOCKET_EVENTS.FRIEND_REQUEST_RESPONSE, handleFriendRequestResponse)

    // Синхронизируем каждые 5 минут
    const interval = setInterval(syncFriendships, 5 * 60 * 1000)

    return () => {
      socket.off(SOCKET_EVENTS.FRIEND_REQUEST, handleFriendRequest)
      socket.off(SOCKET_EVENTS.FRIEND_REQUEST_RESPONSE, handleFriendRequestResponse)
      clearInterval(interval)
    }
  }, [socket, syncFriendships])

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
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 text-xs flex items-center justify-center bg-red-500 text-white rounded-full">
                {pendingCount}
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