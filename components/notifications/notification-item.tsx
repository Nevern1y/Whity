"use client"

import React from 'react'
import { formatDistanceToNow } from "date-fns"
import { ru } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Check, Bell, Award, BookOpen, MessageSquare, Trophy, UserPlus } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import NotificationCard from "@/components/NotificationCard"
import { Notification } from "@/types"

const notificationIcons = {
  course: BookOpen,
  achievement: Award,
  message: MessageSquare,
  news: Bell,
} as const

interface NotificationItemProps {
  notification: Notification
  onAction: () => void
}

export function NotificationItem({ notification, onAction }: NotificationItemProps) {
  if (!notification || !notification.title || !notification.message) {
    return null;
  }

  const getIcon = () => {
    switch (notification.type) {
      case 'course':
        return <BookOpen className="h-4 w-4" />
      case 'achievement':
        return <Trophy className="h-4 w-4" />
      case 'message':
        return <MessageSquare className="h-4 w-4" />
      case 'news':
        return <Bell className="h-4 w-4" />
      case 'friend_request':
        return <UserPlus className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
    addSuffix: true,
    locale: ru
  })

  const handleRead = () => {
    if (!notification.read) {
      onAction()
    }
  }

  const handleAcceptFriend = async (id: string) => {
    try {
      const response = await fetch(`/api/friends/${id}/accept`, {
        method: 'PATCH',
      });
      if (response.ok) {
        // Обновить UI после успешного принятия
        onAction();
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
        onAction();
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
        "transition-colors duration-200"
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