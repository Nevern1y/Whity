"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Manager } from "socket.io-client"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { Bell, MessageSquare, Book, Trophy, Newspaper } from "lucide-react"
import type { Notification } from "@/lib/notifications"

const notificationIcons = {
  message: MessageSquare,
  course: Book,
  achievement: Trophy,
  news: Newspaper,
  system: Bell,
}

export function NotificationList() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    const manager = new Manager(process.env.NEXT_PUBLIC_SOCKET_URL || '', {
      path: '/api/socket',
      autoConnect: true,
      transports: ['websocket']
    })
    const socketInstance = manager.socket('/')

    fetchNotifications()

    socketInstance.on('notification', ({ userId, notification }: { userId: string, notification: Notification }) => {
      setNotifications(prev => [notification, ...prev])
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/icons/notification.png',
        })
      }
    })

    return () => {
      socketInstance.disconnect()
      socketInstance.removeAllListeners()
    }
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications')
      if (!response.ok) throw new Error('Failed to fetch notifications')
      const data = await response.json()
      setNotifications(data)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true }),
      })
      if (!response.ok) throw new Error('Failed to mark notification as read')
      
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === id ? { ...notification, read: true } : notification
        )
      )
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  return (
    <AnimatePresence>
      <div className="space-y-4">
        {notifications.map((notification) => {
          const Icon = notificationIcons[notification.type]
          return (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              onClick={() => !notification.read && markAsRead(notification.id)}
            >
              <Card className={`p-4 hover:shadow-md transition-shadow cursor-pointer ${!notification.read ? 'border-l-4 border-l-primary' : ''}`}>
                <div className="flex gap-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-primary/10`}>
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{notification.title}</p>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                      </div>
                      {!notification.read && (
                        <Badge variant="secondary">Новое</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(notification.createdAt)}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </AnimatePresence>
  )
} 