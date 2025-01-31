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
      const response = await fetch('/api/friends', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendshipId, action })
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
        <Check className="mr-2 h-4 w-4" />
        Принять
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="text-destructive"
        onClick={() => handleAction('reject')}
        disabled={isLoading}
      >
        <X className="mr-2 h-4 w-4" />
        Отклонить
      </Button>
    </div>
  )
} 