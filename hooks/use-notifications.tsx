"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { socketClient } from "@/lib/socket-client"
import type { 
  Notification, 
  NotificationSettings,
  NotificationEvents 
} from "@/types/notifications"
import type { FullNotification } from "@/types/socket"

interface NotificationGroup {
  id: string
  notifications: Notification[]
  count: number
}

interface NotificationsContextType {
  notifications: Notification[]
  groups: NotificationGroup[]
  unreadCount: number
  loading: boolean
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  dismissNotification: (id: string) => Promise<void>
  settings: NotificationSettings
  updateSettings: (settings: Partial<NotificationSettings>) => void
}

const defaultSettings: NotificationSettings = {
  groupSimilar: true,
  showUnreadOnly: false,
  soundEnabled: true,
  desktopNotifications: true,
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined)

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings)

  const unreadCount = notifications.filter(n => !n.read).length

  // Группировка уведомлений
  const groups = notifications.reduce<NotificationGroup[]>((acc, notification) => {
    if (!settings.groupSimilar) {
      return acc
    }

    const existingGroup = acc.find(group => group.id === notification.groupId)
    if (existingGroup) {
      existingGroup.notifications.push(notification)
      existingGroup.count++
    } else {
      acc.push({
        id: notification.groupId || notification.id,
        notifications: [notification],
        count: 1
      })
    }
    return acc
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/notifications')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const initializeSocket = () => {
    const socket = socketClient.getSocket()
    if (!socket) return

    const handleNewNotification = (notification: FullNotification) => {
      setNotifications(prev => [notification, ...prev])
      if (settings.soundEnabled) {
        new Audio('/notification.mp3').play().catch(console.error)
      }
      if (settings.desktopNotifications && 'Notification' in window) {
        Notification.requestPermission().then((permission: NotificationPermission) => {
          if (permission === 'granted') {
            new Notification(notification.title, {
              body: notification.message,
              icon: '/favicon.ico'
            })
          }
        })
      }
    }

    socketClient.on('notification:new', handleNewNotification)

    return () => {
      socketClient.off('notification:new', handleNewNotification)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true })
      })
      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => n.id === id ? { ...n, read: true } : n)
        )
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST'
      })
      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => ({ ...n, read: true }))
        )
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const dismissNotification = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== id))
      }
    } catch (error) {
      console.error('Error dismissing notification:', error)
    }
  }

  useEffect(() => {
    fetchNotifications()
    const cleanup = initializeSocket()
    loadSettings()
    return cleanup
  }, [])

  const loadSettings = () => {
    const savedSettings = localStorage.getItem('notification-settings')
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
  }

  const updateSettings = (newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings }
      localStorage.setItem('notification-settings', JSON.stringify(updated))
      return updated
    })
  }

  return (
    <NotificationsContext.Provider value={{
      notifications,
      groups,
      unreadCount,
      loading,
      markAsRead,
      markAllAsRead,
      dismissNotification,
      settings,
      updateSettings,
    }}>
      {children}
    </NotificationsContext.Provider>
  )
}

export const useNotifications = () => {
  const context = useContext(NotificationsContext)
  if (!context) {
    throw new Error('useNotifications must be used within NotificationsProvider')
  }
  return context
} 