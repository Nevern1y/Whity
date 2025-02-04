"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"
import { toast } from "sonner"
import { friendshipCache } from "@/lib/friendship-cache"

interface CancelFriendRequestButtonProps {
  friendshipId: string
  userId: string
  onCancel?: () => void
}

export function CancelFriendRequestButton({
  friendshipId,
  userId,
  onCancel
}: CancelFriendRequestButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleCancel = async () => {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/friends/${friendshipId}`, {
        method: 'DELETE'
      })

      if (!res.ok) throw new Error('Failed to cancel request')

      friendshipCache.invalidate(userId)
      toast.success('Заявка в друзья отменена')
      onCancel?.()
    } catch (error) {
      toast.error('Не удалось отменить заявку')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCancel}
      disabled={isLoading}
    >
      {isLoading ? 'Отмена...' : 'Отменить заявку'}
    </Button>
  )
} 