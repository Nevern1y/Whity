"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AnimatePresence } from "framer-motion"
import { useAnimation } from "@/components/providers/animation-provider"
import { listItem, staggerContainer, transitions } from "@/lib/framer-animations"
import { useNotifications } from "./notifications-context"
import { formatDate } from "@/lib/utils"
import { Bell, MessageSquare, Book, Trophy, Newspaper } from "lucide-react"
import type { Notification } from "@/types/notifications"
import type { LucideIcon } from "lucide-react"

// Map notification types to icons
const notificationIcons: Record<string, LucideIcon> = {
  message: MessageSquare,
  course: Book,
  achievement: Trophy,
  news: Newspaper,
  system: Bell,
}

export function NotificationList() {
  const { notifications, markAsRead } = useNotifications()
  const [isLoading, setIsLoading] = useState(false)
  const { m } = useAnimation()

  if (!m) {
    return (
      <div className="space-y-2 p-4">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Нет уведомлений
          </div>
        ) : (
          notifications.map((notification) => {
            const Icon = notificationIcons[notification.type] || Bell
            const createdAtDate = typeof notification.createdAt === 'string' 
              ? new Date(notification.createdAt)
              : notification.createdAt

            return (
              <Card 
                key={notification.id}
                className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => !notification.read && markAsRead(notification.id)}
              >
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium leading-none">
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <Badge variant="default" className="flex-shrink-0">
                          Новое
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {notification.message}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {formatDate(createdAtDate)}
                    </p>
                  </div>
                </div>
              </Card>
            )
          })
        )}
      </div>
    )
  }

  return (
    <m.div
      className="space-y-2 p-4"
      variants={staggerContainer}
      transition={transitions.default}
      initial="initial"
      animate="animate"
    >
      <AnimatePresence mode="popLayout">
        {notifications.length === 0 ? (
          <m.div
            variants={listItem}
            transition={transitions.default}
            className="text-center py-8 text-muted-foreground"
          >
            Нет уведомлений
          </m.div>
        ) : (
          notifications.map((notification) => {
            const Icon = notificationIcons[notification.type] || Bell
            const createdAtDate = typeof notification.createdAt === 'string' 
              ? new Date(notification.createdAt)
              : notification.createdAt

            return (
              <m.div
                key={notification.id}
                variants={listItem}
                transition={transitions.default}
                layout
                layoutId={notification.id}
                onClick={() => !notification.read && markAsRead(notification.id)}
              >
                <Card className="p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium leading-none">
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <Badge variant="default" className="flex-shrink-0">
                            Новое
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {notification.message}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {formatDate(createdAtDate)}
                      </p>
                    </div>
                  </div>
                </Card>
              </m.div>
            )
          })
        )}
      </AnimatePresence>
    </m.div>
  )
} 