"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useNotifications } from "./notifications-context"
import { NotificationItem } from "./notification-item"
import { ScrollArea } from "@/components/ui/scroll-area"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Bell } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { Notification } from "@/types"

export function NotificationsList() {
  const { notifications, markAsRead, loading } = useNotifications()
  const [notificationsState, setNotificationsState] = useState<Notification[]>([])

  useEffect(() => {
    // Загружаем уведомления при монтировании
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications')
      if (!response.ok) throw new Error('Failed to fetch notifications')
      const data = await response.json()
      setNotificationsState(data)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <LoadingSpinner />
      </div>
    )
  }

  if (notifications.length === 0) {
    return (
      <div className={cn(
        "flex flex-col items-center justify-center",
        "h-[60vh] md:h-[40vh]",
        "p-4 text-center"
      )}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mx-auto">
            <Bell className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">
              Нет новых уведомлений
            </h3>
            <p className="text-sm text-muted-foreground">
              Здесь будут появляться ваши уведомления
            </p>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <ScrollArea className="h-[300px]">
      <div className="space-y-4 p-4">
        {notificationsState.map((notification: Notification) => (
          <NotificationItem 
            key={notification.id} 
            notification={notification}
            onAction={fetchNotifications}
          />
        ))}
      </div>
    </ScrollArea>
  )
} 