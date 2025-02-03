"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { UserPlus, UserCheck, UserMinus, Loader2, MessageSquare } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

interface AddFriendButtonProps {
  targetUserId: string
  initialStatus: 'NONE' | 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'SELF'
}

export function AddFriendButton({ targetUserId, initialStatus }: AddFriendButtonProps) {
  const [status, setStatus] = useState(initialStatus)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setStatus(initialStatus)
  }, [initialStatus])

  const handleAddFriend = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId })
      })

      if (response.ok) {
        setStatus('PENDING')
        window.dispatchEvent(new CustomEvent('friendship-updated', { 
          detail: { targetUserId, status: 'PENDING' } 
        }))
        toast.success('Запрос в друзья отправлен')
      }
    } catch (error) {
      toast.error('Не удалось отправить запрос')
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
        window.dispatchEvent(new CustomEvent('friendship-updated', { 
          detail: { targetUserId, status: 'ACCEPTED' } 
        }))
        toast.success('Заявка в друзья принята')
        
        setTimeout(() => {
          router.push(`/messages?userId=${targetUserId}`)
        }, 1500)
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
        window.dispatchEvent(new CustomEvent('friendship-updated', { 
          detail: { targetUserId, status: 'NONE' } 
        }))
        toast.success('Пользователь удален из друзей')
      }
    } catch (error) {
      toast.error('Не удалось удалить из друзей')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartChat = () => {
    router.push(`/messages?userId=${targetUserId}`)
  }

  useEffect(() => {
    const handleFriendshipUpdate = (event: CustomEvent) => {
      if (event.detail.targetUserId === targetUserId) {
        setStatus(event.detail.status)
      }
    }
    
    window.addEventListener('friendship-updated', handleFriendshipUpdate as EventListener)
    return () => {
      window.removeEventListener('friendship-updated', handleFriendshipUpdate as EventListener)
    }
  }, [targetUserId])

  if (status === 'ACCEPTED') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="text-green-500 hover:text-green-600"
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
    if (initialStatus === 'PENDING' && !isLoading) {
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAcceptFriend}
        >
          Принять запрос
        </Button>
      )
    }
    return (
      <Button variant="ghost" size="sm" disabled>
        <Loader2 className="h-4 w-4 mr-2" />
        Запрос отправлен
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleAddFriend}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <UserPlus className="h-4 w-4 mr-2" />
      )}
      Добавить в друзья
    </Button>
  )
} 