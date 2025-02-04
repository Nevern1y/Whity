"use client"

import { Button } from "@/components/ui/button"
import { FriendshipStatus } from "@prisma/client"
import { useState } from "react"
import { toast } from "sonner"
import { FriendshipStatusBadge } from "./friendship-status-badge"
import { FRIENDSHIP_STATUS, ExtendedFriendshipStatus } from "@/lib/constants"

interface FriendActionButtonProps {
  userId: string
  initialStatus: ExtendedFriendshipStatus
  isIncoming?: boolean
  onStatusChange?: (newStatus: ExtendedFriendshipStatus) => void
}

export function FriendActionButton({
  userId,
  initialStatus,
  isIncoming,
  onStatusChange
}: FriendActionButtonProps) {
  const [status, setStatus] = useState<ExtendedFriendshipStatus>(initialStatus)
  const [isLoading, setIsLoading] = useState(false)

  const handleAction = async () => {
    if (!userId) return
    try {
      setIsLoading(true)
      
      if (status === FRIENDSHIP_STATUS.NONE) {
        // Отправка заявки
        const res = await fetch('/api/friends', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ targetUserId: userId })
        })
        
        if (!res.ok) throw new Error('Failed to send friend request')
        
        setStatus(FRIENDSHIP_STATUS.PENDING)
        toast.success('Заявка в друзья отправлена')
      } else if (status === FRIENDSHIP_STATUS.PENDING && isIncoming) {
        // Принятие заявки
        const res = await fetch(`/api/friends/${userId}/accept`, {
          method: 'PATCH'
        })
        
        if (!res.ok) throw new Error('Failed to accept friend request')
        
        setStatus(FRIENDSHIP_STATUS.ACCEPTED)
        toast.success('Заявка в друзья принята')
      } else if (
        status === FRIENDSHIP_STATUS.ACCEPTED || 
        status === FRIENDSHIP_STATUS.PENDING
      ) {
        // Удаление из друзей или отмена заявки
        const res = await fetch(`/api/friends/${userId}`, {
          method: 'DELETE'
        })
        
        if (!res.ok) throw new Error('Failed to remove friend')
        
        setStatus(FRIENDSHIP_STATUS.NONE)
        toast.success(
          status === FRIENDSHIP_STATUS.ACCEPTED 
            ? 'Пользователь удален из друзей' 
            : 'Заявка в друзья отменена'
        )
      }
      
      onStatusChange?.(status)
    } catch (error) {
      toast.error('Что-то пошло не так')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleAction}
      disabled={isLoading}
      variant={status === FRIENDSHIP_STATUS.NONE ? "default" : "outline"}
      size="sm"
    >
      {isLoading ? "..." : getButtonText(status, isIncoming)}
    </Button>
  )
}

function getButtonText(status: ExtendedFriendshipStatus, isIncoming?: boolean): string {
  if (status === FRIENDSHIP_STATUS.PENDING && isIncoming) {
    return "Принять заявку"
  }
  
  return {
    [FRIENDSHIP_STATUS.NONE]: "Добавить в друзья",
    [FRIENDSHIP_STATUS.PENDING]: "Заявка отправлена",
    [FRIENDSHIP_STATUS.ACCEPTED]: "Удалить из друзей",
    [FRIENDSHIP_STATUS.REJECTED]: "Заявка отклонена"
  }[status]
} 