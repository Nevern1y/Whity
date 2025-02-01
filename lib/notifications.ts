import { prisma } from "@/lib/prisma"

type NotificationType = "course" | "achievement" | "message" | "news" | "system"

interface NotificationMetadata {
  [key: string]: string | number | boolean | null
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: string
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
      metadata: metadata ? JSON.stringify(metadata) : null
    }
  })

  if (global.io) {
    global.io.to(userId).emit('notification:new', notification)
  }

  return notification
}

export async function markAsRead(notificationId: string, userId: string) {
  return await prisma.notification.update({
    where: {
      id: notificationId,
      userId
    },
    data: { read: true }
  })
} 