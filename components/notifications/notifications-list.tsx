"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useNotifications } from "./notifications-context"
import { NotificationItem } from "./notification-item"
import { ScrollArea } from "@/components/ui/scroll-area"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Bell } from "lucide-react"
import { cn } from "@/lib/utils"

export function NotificationsList() {
  const { notifications, markAsRead, loading } = useNotifications()

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
    <AnimatePresence mode="popLayout">
      {notifications.map((notification, index) => (
        <motion.div
          key={notification.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.2, delay: index * 0.1 }}
        >
          <NotificationItem
            notification={notification}
            onRead={markAsRead}
            className={cn(
              "border-b last:border-b-0",
              "hover:bg-accent/5",
              "transition-colors duration-200",
              "rounded-lg my-2 p-3"
            )}
          />
        </motion.div>
      ))}
    </AnimatePresence>
  )
} 