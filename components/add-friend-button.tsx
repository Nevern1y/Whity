"use client"

import { Button } from "@/components/ui/button"
import { UserPlus, UserCheck, Loader2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

interface AddFriendButtonProps {
  targetUserId: string
  initialStatus?: 'NONE' | 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'SELF'
}

export function AddFriendButton({ 
  targetUserId, 
  initialStatus = 'NONE'
}: AddFriendButtonProps) {
  const [status, setStatus] = useState(initialStatus)
  const [isLoading, setIsLoading] = useState(false)

  const handleAddFriend = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId })
      })

      if (!response.ok) throw new Error('Failed to send friend request')

      setStatus('PENDING')
      toast.success('Запрос в друзья отправлен')
    } catch (error) {
      toast.error('Не удалось отправить запрос')
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'SELF') return null

  if (status === 'ACCEPTED') {
    return (
      <Button variant="ghost" size="sm" disabled>
        <UserCheck className="h-4 w-4 mr-2" />
        В друзьях
      </Button>
    )
  }

  if (status === 'PENDING') {
    return (
      <Button variant="outline" size="sm" disabled>
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Запрос отправлен
      </Button>
    )
  }

  return (
    <Button 
      variant="ghost" 
      size="sm"
      onClick={(e) => {
        e.stopPropagation()
        handleAddFriend()
      }}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <UserPlus className="h-4 w-4 mr-2" />
      )}
      Добавить
    </Button>
  )
} 