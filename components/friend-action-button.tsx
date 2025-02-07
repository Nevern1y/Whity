"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { UserPlus, Clock } from "lucide-react"
import { toast } from "sonner"
import { motion } from "framer-motion"

interface FriendActionButtonProps {
  userId: string
  initialStatus: string
  isSender?: boolean
}

export function FriendActionButton({ 
  userId, 
  initialStatus,
  isSender = false
}: FriendActionButtonProps) {
  const [status, setStatus] = useState(initialStatus)
  const [isLoading, setIsLoading] = useState(false)

  const handleAddFriend = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: userId })
      })

      if (!response.ok) throw new Error()

      setStatus("PENDING")
      toast.success("Запрос отправлен")
    } catch (error) {
      toast.error("Что-то пошло не так")
    } finally {
      setIsLoading(false)
    }
  }

  // Если это входящий запрос (PENDING и не isSender) - не показываем кнопку
  if (status === "PENDING" && !isSender) {
    return null
  }

  // Если уже друзья или запрос отправлен нами
  if (status === "ACCEPTED" || (status === "PENDING" && isSender)) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Button variant="secondary" disabled className="gap-2">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Clock className="h-4 w-4" />
          </motion.div>
          Запрос отправлен
        </Button>
      </motion.div>
    )
  }

  // Показываем кнопку "Добавить в друзья" только если нет активных запросов
  if (status === "NONE") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Button
          onClick={handleAddFriend}
          disabled={isLoading}
          className="gap-2"
        >
          <UserPlus className="h-4 w-4" />
          Добавить в друзья
        </Button>
      </motion.div>
    )
  }

  return null
} 