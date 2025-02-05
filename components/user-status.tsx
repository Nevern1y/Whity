"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"

export function UserStatus() {
  const { data: session } = useSession()
  const [isUpdating, setIsUpdating] = useState(false)

  const updateStatus = async (status: string) => {
    if (!session?.user) {
      toast.error("Необходимо войти в систему")
      return
    }

    try {
      setIsUpdating(true)
      const response = await fetch("/api/users/update-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status })
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || "Failed to update status")
      }

      const data = await response.json()
      toast.success("Статус обновлен")
      return data
    } catch (error) {
      console.error("Status update error:", error)
      toast.error("Не удалось обновить статус")
    } finally {
      setIsUpdating(false)
    }
  }

  // ... остальной код компонента
} 