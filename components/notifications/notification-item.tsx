"use client"

import React from 'react'
import { formatDistanceToNow } from "date-fns"
import { ru } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Check, Bell, Award, BookOpen, MessageSquare } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import NotificationCard from "@/components/NotificationCard"

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
  if (!notification || !notification.title || !notification.message) {
    return null;
  }

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

  const handleAcceptFriend = async (id: string) => {
    try {
      const response = await fetch(`/api/friends/${id}/accept`, {
        method: 'PATCH',
      });
      if (response.ok) {
        // Обновить UI после успешного принятия
        onRead(id);
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };

  const handleRejectFriend = async (id: string) => {
    try {
      const response = await fetch(`/api/friends/${id}/reject`, {
        method: 'PATCH',
      });
      if (response.ok) {
        // Обновить UI после успешного отклонения
        onRead(id);
      }
    } catch (error) {
      console.error('Error rejecting friend request:', error);
    }
  };

  const content = (
    <NotificationCard
      notification={notification}
      handleRead={handleRead}
      onAccept={handleAcceptFriend}
      onReject={handleRejectFriend}
      className={cn(
        "border-b last:border-b-0",
        "hover:bg-accent/5",
        "transition-colors duration-200",
        className
      )}
    />
  )

  if (notification.link && notification.title && notification.message) {
    return (
      <Link href={notification.link} className="block">
        {content}
      </Link>
    )
  }

  return content
} 