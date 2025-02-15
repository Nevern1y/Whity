"use client"

import { useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { Bell, MessageSquare, Book, Trophy, Newspaper } from "lucide-react"
import { useNotifications } from "./notifications/notifications-context"
import { useAnimation } from "@/components/providers/animation-provider"
import { AnimatePresence } from "framer-motion"

interface MobileNotificationsProps {
  onClose: () => void
}

const notificationIcons = {
  message: MessageSquare,
  course: Book,
  achievement: Trophy,
  news: Newspaper,
  system: Bell,
}

export function MobileNotifications({ onClose }: MobileNotificationsProps) {
  const { notifications, markAsRead } = useNotifications()
  const { m } = useAnimation()

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Уведомления</h2>
      </div>
      <div className="flex-1 overflow-auto">
        <m.div
          className="space-y-2 p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <AnimatePresence mode="popLayout">
            {notifications.length === 0 ? (
              <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center py-8 text-muted-foreground"
              >
                Нет уведомлений
              </m.div>
            ) : (
              notifications.map((notification) => {
                const Icon = notificationIcons[notification.type as keyof typeof notificationIcons] || Bell

                return (
                  <m.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
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
                            {formatDate(notification.createdAt)}
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
      </div>
    </div>
  )
} 