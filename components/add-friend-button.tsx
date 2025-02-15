"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { UserPlus, UserCheck, UserMinus, Loader2, MessageSquare, Clock } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useSocket } from "@/hooks/use-socket"
import { SOCKET_EVENTS } from "@/components/providers/socket-provider"

interface AddFriendButtonProps {
  targetUserId: string
  initialStatus?: 'NONE' | 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'SELF'
  isReceivedRequest?: boolean
  className?: string
  fullWidth?: boolean
}

export function AddFriendButton({
  targetUserId,
  initialStatus = 'NONE',
  isReceivedRequest = false,
  className,
  fullWidth = false
}: AddFriendButtonProps) {
  const [status, setStatus] = useState(initialStatus)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const socket = useSocket()

  useEffect(() => {
    setStatus(initialStatus)
  }, [initialStatus])

  useEffect(() => {
    if (!socket) return

    socket.on(SOCKET_EVENTS.FRIEND_REQUEST_RESPONSE, (data) => {
      if (data.friendshipId) {
        setStatus(data.status)
      }
    })

    return () => {
      socket.off(SOCKET_EVENTS.FRIEND_REQUEST_RESPONSE)
    }
  }, [socket])

  const handleAddFriend = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send friend request')
      }
      
      setStatus('PENDING')
      toast.success('Запрос в друзья отправлен')
    } catch (error) {
      console.error('Error adding friend:', error)
      toast.error(error instanceof Error ? error.message : 'Не удалось отправить запрос')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAcceptFriend = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/friends/${targetUserId}/accept`, {
        method: 'PATCH'
      })
      
      if (response.ok) {
        setStatus('ACCEPTED')
        toast.success('Заявка в друзья принята')
        router.refresh()
      }
    } catch (error) {
      toast.error('Не удалось принять заявку')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveFriend = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/friends/${targetUserId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setStatus('NONE')
        toast.success('Пользователь удален из друзей')
        router.refresh()
      }
    } catch (error) {
      toast.error('Не удалось удалить из друзей')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartChat = () => {
    router.push(`/messages/${targetUserId}`)
  }

  const buttonClasses = cn(
    fullWidth ? 'w-full' : 'min-w-[160px]',
    className
  )

  if (status === 'ACCEPTED') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "text-green-500 hover:text-green-600",
              buttonClasses
            )}
          >
            <UserCheck className="h-4 w-4 mr-2" />
            В друзьях
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleStartChat}>
            <MessageSquare className="h-4 w-4 mr-2" />
            Написать сообщение
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={handleRemoveFriend}
            className="text-destructive"
          >
            <UserMinus className="h-4 w-4 mr-2" />
            Удалить из друзей
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  if (status === 'PENDING') {
    if (initialStatus === 'PENDING' && isReceivedRequest && !isLoading) {
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAcceptFriend}
          disabled={isLoading}
          className={buttonClasses}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <>
              <UserCheck className="h-4 w-4 mr-2" />
              Принять запрос
            </>
          )}
        </Button>
      )
    }
    return (
      <Button 
        variant="ghost" 
        size="sm" 
        disabled 
        className={buttonClasses}
      >
        <Clock className="h-4 w-4 mr-2" />
        Запрос отправлен
      </Button>
    )
  }

  return (
    <Button
      variant="secondary"
      onClick={handleAddFriend}
      disabled={status !== 'NONE' || isLoading}
      className={buttonClasses}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <>
          <UserPlus className="h-4 w-4 mr-2" />
          Добавить в друзья
        </>
      )}
    </Button>
  )
} 