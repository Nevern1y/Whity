import type { Metadata } from "next"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { NotificationsContent } from "./_components/notifications-content"

export const metadata: Metadata = {
  title: "Уведомления | Аллель Агро",
  description: "Просмотр и управление уведомлениями"
}

export default async function NotificationsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  // Fetch initial notifications
  const notifications = await prisma.notification.findMany({
    where: {
      userId: session.user.id
    },
    orderBy: {
      createdAt: "desc"
    },
    take: 50
  })

  return <NotificationsContent initialNotifications={notifications} />
}

