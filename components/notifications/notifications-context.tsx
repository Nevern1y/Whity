"use client"

import { createContext, useContext, useState, useCallback, useEffect } from "react"
import { toast } from "sonner"
import { useSocket } from "@/hooks/use-socket"
import { useSession } from "next-auth/react"
import { fetchWithRetry } from '@/lib/api-client'

type NotificationType = 'course' | 'achievement' | 'message' | 'news'

interface Notification {
  id: string
  title: string
  message: string
  type: NotificationType
  read: boolean
  createdAt: Date
  link?: string
}

interface NotificationsContextType {
  notifications: Notification[]
  unreadCount: number
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  loading: boolean
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined)

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const { data: session } = useSession()
  const socket = useSocket(session?.user?.id)

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications')
      if (!response.ok) throw new Error('Failed to fetch notifications')
      const data = await response.json()
      setNotifications(data)
    } catch (error) {
      toast.error("Не удалось загрузить уведомления")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  useEffect(() => {
    if (!socket) return

    // Слушаем новые уведомления
    socket.on("notification:new", (notification: Notification) => {
      setNotifications(prev => [notification, ...prev])
      toast.message("Новое уведомление", {
        description: notification.title,
        action: {
          label: "Посмотреть",
          onClick: () => {
            // Открыть панель уведомлений или перейти по ссылке
            if (notification.link) {
              window.location.href = notification.link
            }
          }
        }
      })
    })

    // Слушаем обновления уведомлений
    socket.on("notification:update", (updatedNotification: Notification) => {
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === updatedNotification.id
            ? updatedNotification
            : notification
        )
      )
    })

    return () => {
      socket.off("notification:new")
      socket.off("notification:update")
    }
  }, [socket])

  const markAsRead = useCallback(async (id: string) => {
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
      toast.error("Не удалось отметить уведомление как прочитанное")
      console.error(error)
    }
  }, [])

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetchWithRetry('/api/notifications/mark-all-read', {
        method: 'POST',
      })
      
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      )
    } catch (error) {
      toast.error("Не удалось отметить все уведомления как прочитанные")
      console.error(error)
    }
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <NotificationsContext.Provider 
      value={{ 
        notifications, 
        unreadCount, 
        markAsRead, 
        markAllAsRead,
        loading 
      }}
    >
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationsContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider')
  }
  return context
} 