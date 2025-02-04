"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface FriendRequestActionsProps {
  friendshipId: string
}

export function FriendRequestActions({ friendshipId }: FriendRequestActionsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleAction = async (action: 'accept' | 'reject') => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/friends/${friendshipId}/${action}`, {
        method: 'PATCH'
      })

      if (!response.ok) throw new Error('Failed to process request')

      toast.success(action === 'accept' ? 'Запрос принят' : 'Запрос отклонен')
      router.refresh()
    } catch (error) {
      toast.error('Произошла ошибка')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant="outline"
        onClick={() => handleAction('accept')}
        disabled={isLoading}
      >
        <Check className="h-4 w-4 mr-2" />
        Принять
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="text-destructive"
        onClick={() => handleAction('reject')}
        disabled={isLoading}
      >
        <X className="h-4 w-4 mr-2" />
        Отклонить
      </Button>
    </div>
  )
} 