import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { socketClient } from "@/lib/socket-client"
import type { FullNotification } from "@/types/socket"

type NotificationType = "course" | "achievement" | "message" | "news" | "system"

type NotificationMetadata = Record<string, string | number | boolean | null>

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: NotificationType
  read: boolean
  link?: string | null
  metadata?: NotificationMetadata | null
  createdAt: Date
}

export async function createNotification({
  userId,
  title,
  message,
  type,
  link,
  metadata = null
}: {
  userId: string
  title: string
  message: string
  type: NotificationType
  link?: string
  metadata?: NotificationMetadata | null
}) {
  const notification = await prisma.notification.create({
    data: {
      userId,
      title,
      message,
      type,
      link,
      metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : null
    }
  })

  // Отправляем через глобальный io для серверных уведомлений
  if (global.io) {
    global.io.to(userId).emit('notification:new', {
      ...notification,
      read: false,
      createdAt: new Date(),
      userId
    } as FullNotification)
  }

  return notification
} 