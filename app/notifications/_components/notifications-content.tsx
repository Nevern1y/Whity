"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatDate, cn } from "@/lib/utils"
import { Bell, Book, Trophy, Star, MessageSquare, Check, Trash2, Loader2, Filter } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { useSocket } from "@/hooks/use-socket"
import { AnimatePresence, motion } from "framer-motion"
import { useAnimation } from "@/components/providers/animation-provider"
import { listItem, staggerContainer, transitions } from "@/lib/framer-animations"
import type { Notification } from "@prisma/client"
import { Skeleton } from "@/components/ui/skeleton"
import { useMediaQuery } from "@/hooks/use-media-query"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useLocalStorage } from "@/hooks/use-local-storage"

const notificationTypes = {
  course: {
    icon: Book,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    label: "Курсы"
  },
  achievement: {
    icon: Trophy,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    label: "Достижения"
  },
  rating: {
    icon: Star,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    label: "Оценки"
  },
  message: {
    icon: MessageSquare,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    label: "Сообщения"
  },
  system: {
    icon: Bell,
    color: "text-primary",
    bgColor: "bg-primary/10",
    label: "Система"
  },
}

interface NotificationsContentProps {
  initialNotifications: Notification[]
}

interface NotificationSettings {
  sound: boolean
  vibration: boolean
  filters: Record<string, boolean>
}

const defaultSettings: NotificationSettings = {
  sound: true,
  vibration: true,
  filters: Object.keys(notificationTypes).reduce((acc, type) => ({
    ...acc,
    [type]: true
  }), {})
}

export function NotificationsContent({ initialNotifications }: NotificationsContentProps) {
  const [notifications, setNotifications] = useState(initialNotifications)
  const [isMarkingRead, setIsMarkingRead] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const socket = useSocket()
  const { m } = useAnimation()
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [settings, setSettings] = useLocalStorage<NotificationSettings>(
    "notification-settings",
    defaultSettings
  )

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    if (!settings.sound) return
    const audio = new Audio("/sounds/notification.mp3")
    audio.play().catch(console.error)
  }, [settings.sound])

  // Vibrate device
  const vibrate = useCallback(() => {
    if (!settings.vibration || !navigator.vibrate) return
    navigator.vibrate(200)
  }, [settings.vibration])

  useEffect(() => {
    if (!socket) return

    socket.on("notification", (notification: Notification) => {
      if (!settings.filters[notification.type]) return
      
      setNotifications(prev => [notification, ...prev])
      playNotificationSound()
      vibrate()
    })

    return () => {
      socket.off("notification")
    }
  }, [socket, settings.filters, playNotificationSound, vibrate])

  const handleMarkAllAsRead = async () => {
    try {
      setIsMarkingRead(true)
      // Optimistic update
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))

      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST'
      })

      if (!response.ok) {
        // Revert on error
        setNotifications(initialNotifications)
        throw new Error('Failed to mark all as read')
      }

      toast.success('Все уведомления отмечены как прочитанные')
    } catch (error) {
      console.error('Error marking all as read:', error)
      toast.error('Не удалось отметить уведомления как прочитанные')
    } finally {
      setIsMarkingRead(false)
    }
  }

  const handleClearAll = async () => {
    try {
      setIsClearing(true)
      // Optimistic update
      const previousNotifications = notifications
      setNotifications([])

      const response = await fetch('/api/notifications/clear', {
        method: 'DELETE'
      })

      if (!response.ok) {
        // Revert on error
        setNotifications(previousNotifications)
        throw new Error('Failed to clear notifications')
      }

      toast.success('Уведомления очищены')
    } catch (error) {
      console.error('Error clearing notifications:', error)
      toast.error('Не удалось очистить уведомления')
    } finally {
      setIsClearing(false)
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      // Optimistic update
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        )
      )

      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true })
      })

      if (!response.ok) {
        // Revert on error
        setNotifications(prev =>
          prev.map(n =>
            n.id === notificationId ? { ...n, read: false } : n
          )
        )
        throw new Error('Failed to mark notification as read')
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
      toast.error('Не удалось отметить уведомление как прочитанное')
    }
  }

  const toggleSetting = (key: keyof NotificationSettings) => {
    setSettings((prev: NotificationSettings) => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const toggleFilter = (type: string) => {
    setSettings((prev: NotificationSettings) => ({
      ...prev,
      filters: {
        ...prev.filters,
        [type]: !prev.filters[type]
      }
    }))
  }

  // Group notifications by date
  const groupedNotifications = notifications.reduce((groups, notification) => {
    const date = new Date(notification.createdAt).toLocaleDateString()
    if (!groups[date]) groups[date] = []
    if (settings.filters[notification.type]) {
      groups[date].push(notification)
    }
    return groups
  }, {} as Record<string, Notification[]>)

  if (error) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Card className="p-6">
          <p className="text-destructive">{error}</p>
          <Button 
            className="mt-4" 
            onClick={() => window.location.reload()}
          >
            Попробовать снова
          </Button>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-start gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <motion.div 
      className="container mx-auto py-8 px-4"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      transition={transitions.default}
    >
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Уведомления</h1>
            <Badge variant="secondary" className="ml-2">
              {notifications.filter(n => !n.read).length}
            </Badge>
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Настройки</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="p-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sound">Звук</Label>
                    <Switch
                      id="sound"
                      checked={settings.sound}
                      onCheckedChange={() => toggleSetting('sound')}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <Label htmlFor="vibration">Вибрация</Label>
                    <Switch
                      id="vibration"
                      checked={settings.vibration}
                      onCheckedChange={() => toggleSetting('vibration')}
                    />
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Фильтры</DropdownMenuLabel>
                {Object.entries(notificationTypes).map(([type, { label, icon: Icon }]) => (
                  <DropdownMenuItem
                    key={type}
                    onSelect={(e) => {
                      e.preventDefault()
                      toggleFilter(type)
                    }}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span>{label}</span>
                      </div>
                      <Switch
                        checked={settings.filters[type]}
                        onCheckedChange={() => toggleFilter(type)}
                      />
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={isMarkingRead || notifications.every(n => n.read)}
            >
              {isMarkingRead ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Прочитать все
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-destructive hover:text-destructive"
              onClick={handleClearAll}
              disabled={isClearing || notifications.length === 0}
            >
              {isClearing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Очистить
            </Button>
          </div>
        </div>

        <motion.div
          className="space-y-8"
          variants={staggerContainer}
        >
          <AnimatePresence mode="popLayout">
            {Object.keys(groupedNotifications).length === 0 ? (
              <motion.div
                variants={listItem}
                className="text-center py-8 text-muted-foreground"
              >
                Нет уведомлений
              </motion.div>
            ) : (
              Object.entries(groupedNotifications).map(([date, notifications]) => (
                <motion.div key={date} variants={listItem} className="space-y-4">
                  <h2 className="text-sm font-medium text-muted-foreground">
                    {new Date(date).toLocaleDateString('ru-RU', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </h2>
                  {notifications.map((notification) => {
                    const type = notificationTypes[notification.type as keyof typeof notificationTypes] || notificationTypes.system
                    const Icon = type.icon

                    return (
                      <motion.div
                        key={notification.id}
                        variants={listItem}
                        layout
                        layoutId={notification.id}
                        onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                      >
                        <Card
                          className={cn(
                            "transition-all hover:shadow-md cursor-pointer",
                            !notification.read && "border-l-4 border-l-primary"
                          )}
                        >
                          <CardContent className="flex items-start gap-4 p-4">
                            <div className={cn(
                              "flex h-10 w-10 items-center justify-center rounded-full",
                              type.bgColor
                            )}>
                              <Icon className={cn("h-5 w-5", type.color)} />
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="font-medium">{notification.title}</p>
                                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                                </div>
                                {!notification.read && (
                                  <Badge variant="secondary" className="ml-2">Новое</Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(notification.createdAt)}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )
                  })}
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  )
} 