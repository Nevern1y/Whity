import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Server } from "socket.io"
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

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    const notification = await prisma.notification.create({
      data: {
        ...data,
        userId: session.user.id
      }
    })

    return NextResponse.json(notification)
  } catch (error) {
    return NextResponse.json({ message: "Internal Error" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id, read } = await request.json()
    const notification = await prisma.notification.update({
      where: {
        id,
        userId: session.user.id
      },
      data: { read }
    })

    return NextResponse.json(notification)
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to update notification" },
      { status: 500 }
    )
  }
}

// Утилита для создания уведомлений
export async function createNotification({
  userId,
  title,
  message,
  type,
  link,
  metadata,
}: {
  userId: string
  title: string
  message: string
  type: string
  link?: string
  metadata?: any
}) {
  const notification = await prisma.notification.create({
    data: {
      userId,
      title,
      message,
      type,
      link,
      metadata,
    },
  })

  // Используем глобальный io из res.socket.server.io
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

