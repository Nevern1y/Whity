import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import type { Notification } from "@/types"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const notifications = await prisma.notification.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(notifications)
  } catch (error) {
    console.error("[NOTIFICATIONS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { title, message, type, link, metadata } = await req.json()
    const notification = await createNotification({
      userId: session.user.id,
      title,
      message,
      type,
      link,
      metadata
    })

    return NextResponse.json(notification)
  } catch (error) {
    console.error("[NOTIFICATIONS_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { id } = await req.json()
    const notification = await markAsRead(id, session.user.id)

    return NextResponse.json(notification)
  } catch (error) {
    console.error("[NOTIFICATIONS_PATCH]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

// Утилита для создания уведомлений
export async function createNotification({
  userId,
  title,
  message,
  type,
  link,
  metadata
}: {
  userId: string
  title: string
  message: string
  type: string
  link?: string
  metadata?: Record<string, any>
}) {
  const notification = await prisma.notification.create({
    data: {
      userId,
      title,
      message,
      type,
      link,
      read: false,
      metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : null
    }
  })

  if (global.io) {
    global.io.to(userId).emit("notification:new", notification)
  }

  return notification
}

export async function markAsRead(notificationId: string, userId: string) {
  const notification = await prisma.notification.update({
    where: {
      id: notificationId,
      userId,
    },
    data: {
      read: true,
    },
  })

  if (global.io) {
    global.io.to(userId).emit("notification:update", notification)
  }

  return notification
}

