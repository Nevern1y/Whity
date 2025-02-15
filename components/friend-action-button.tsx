"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { UserPlus, UserCheck, UserMinus, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAnimation } from "@/components/providers/animation-provider"

interface FriendActionButtonProps {
  targetUserId: string
  initialStatus: 'NONE' | 'PENDING' | 'ACCEPTED' | 'REJECTED'
  isReceivedRequest?: boolean
  className?: string
}

export function FriendActionButton({ 
  targetUserId, 
  initialStatus = 'NONE',
  isReceivedRequest = false,
  className
}: FriendActionButtonProps) {
  const [status, setStatus] = useState(initialStatus)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { m } = useAnimation()

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

  if (status === 'ACCEPTED') {
    return (
      <m.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRemoveFriend}
          disabled={isLoading}
          className={cn(
            "text-green-500 hover:text-green-600",
            className
          )}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <UserCheck className="h-4 w-4 mr-2" />
              В друзьях
            </>
          )}
        </Button>
      </m.div>
    )
  }

  if (status === 'PENDING') {
    if (isReceivedRequest && !isLoading) {
      return (
        <m.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAcceptFriend}
            className={className}
          >
            Принять запрос
          </Button>
        </m.div>
      )
    }
    return (
      <m.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
      >
        <Button 
          variant="ghost" 
          size="sm" 
          disabled 
          className={className}
        >
          Запрос отправлен
        </Button>
      </m.div>
    )
  }

  return (
    <m.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <Button
        variant="secondary"
        onClick={handleAddFriend}
        disabled={status !== 'NONE' || isLoading}
        className={className}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : initialStatus === 'PENDING' ? (
          <>
            <UserMinus className="h-4 w-4 mr-2" />
            Запрос отправлен
          </>
        ) : (
          <>
            <UserPlus className="h-4 w-4 mr-2" />
            Добавить в друзья
          </>
        )}
      </Button>
    </m.div>
  )
} 