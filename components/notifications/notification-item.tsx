"use client"

import React from 'react'
import { formatDistanceToNow } from "date-fns"
import { ru } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Check, Bell, Award, BookOpen, MessageSquare } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

const notificationIcons = {
  course: BookOpen,
  achievement: Award,
  message: MessageSquare,
  news: Bell,
} as const

export interface NotificationItemProps {
  notification: {
    id: string
    title: string
    message: string
    type: keyof typeof notificationIcons
    read: boolean
    createdAt: Date
    link?: string
  }
  onRead: (id: string) => void
  className?: string
}

export function NotificationItem({ notification, onRead, className }: NotificationItemProps) {
  const Icon = notificationIcons[notification.type]
  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
    addSuffix: true,
    locale: ru
  })

  const handleRead = () => {
    if (!notification.read) {
      onRead(notification.id)
    }
  }

  const content = (
    <div 
      className={cn(
        "flex items-start gap-4 p-4 transition-all rounded-lg",
        "hover:bg-accent/50 card-hover",
        notification.read 
          ? "bg-background" 
          : "bg-gradient-to-r from-primary/10 to-background border-l-2 border-primary",
        className
      )}
      onClick={handleRead}
    >
      <div className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full",
        notification.read 
          ? "bg-muted text-muted-foreground" 
          : "bg-primary/10 text-primary"
      )}>
        <Icon className={cn(
          "h-5 w-5",
          notification.read ? "text-muted-foreground" : "text-primary"
        )} />
      </div>
      <div className="flex-1 space-y-1">
        <p className={cn(
          "text-sm font-medium leading-none",
          notification.read ? "text-muted-foreground" : "text-foreground"
        )}>
          {notification.title}
        </p>
        <p className={cn(
          "text-sm text-muted-foreground",
          "line-clamp-2"
        )}>
          {notification.message}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {timeAgo}
        </p>
      </div>
      {!notification.read && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="shrink-0 text-primary"
          onClick={(e) => {
            e.stopPropagation()
            onRead(notification.id)
          }}
        >
          <Check className="h-4 w-4" />
          <span className="sr-only">Отметить как прочитанное</span>
        </Button>
      )}
    </div>
  )

  if (notification.link) {
    return (
      <Link href={notification.link} className="block">
        {content}
      </Link>
    )
  }

  return content
} 