"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell, Book, Trophy, MessageSquare, Newspaper } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDate } from "@/lib/utils"

type NotificationType = 'course' | 'achievement' | 'message' | 'news'

interface Notification {
  id: string
  title: string
  message: string
  type: NotificationType
  read: boolean
  createdAt: Date
}

const notificationTypes = {
  course: {
    icon: Book,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  achievement: {
    icon: Trophy,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
  },
  message: {
    icon: MessageSquare,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  news: {
    icon: Newspaper,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
} as const

export function NotificationsList() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "Новый курс доступен",
      message: "Начните изучение курса «Основы птицеводства» прямо сейчас",
      type: "course",
      read: false,
      createdAt: new Date(),
    },
    {
      id: "2",
      title: "Достижение получено",
      message: "Поздравляем! Вы завершили свой первый курс",
      type: "achievement",
      read: false,
      createdAt: new Date(),
    },
    // Можно добавить больше уведомлений
  ])

  return (
    <div className="space-y-3">
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
          <Bell className="h-12 w-12 mb-4 opacity-20" />
          <p>Нет уведомлений</p>
        </div>
      ) : (
        notifications.map((notification) => {
          const type = notificationTypes[notification.type]
          const Icon = type.icon

          return (
            <Card 
              key={notification.id}
              className={cn(
                "transition-all hover:shadow-md",
                !notification.read && "border-l-4 border-l-primary"
              )}
            >
              <div className="flex items-start gap-3 p-3">
                <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full", type.bgColor)}>
                  <Icon className={cn("h-5 w-5", type.color)} />
                </div>
                <div className="flex-1 space-y-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{notification.title}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                    </div>
                    {!notification.read && (
                      <Badge variant="secondary" className="shrink-0">
                        Новое
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(notification.createdAt)}
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