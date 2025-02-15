"use client"

import { useEffect } from "react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { ru } from "date-fns/locale"
import { Bell, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useSocket } from "@/hooks/use-socket"
import { useNotifications } from "./notifications-context"
import { cn } from "@/lib/utils"

export function NotificationsList() {
  const socket = useSocket()
  const { notifications, loading: isLoading, markAsRead } = useNotifications()

  useEffect(() => {
    if (!socket) return

    socket.on("notification:new", () => {
      // Notifications will be updated through context
    })

    socket.on("notification:update", () => {
      // Notifications will be updated through context
    })

    return () => {
      socket.off("notification:new")
      socket.off("notification:update")
    }
  }, [socket])

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-start gap-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!notifications?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Bell className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">
          У вас пока нет уведомлений
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="flex items-start gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
          onClick={() => !notification.read && markAsRead(notification.id)}
        >
          <Bell className="h-8 w-8 text-muted-foreground" />
          <div className="space-y-1 flex-1">
            <p className={cn("text-sm font-medium", !notification.read && "text-primary")}>
              {notification.title}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(notification.createdAt), {
                addSuffix: true,
                locale: ru
              })}
            </p>
          </div>
          {notification.read && (
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Check className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
    </div>
  )
} 