import { Metadata } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import { Bell, Book, Trophy, Star, MessageSquare, Check, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "Уведомления | Аллель Агро",
  description: "Центр уведомлений",
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
  rating: {
    icon: Star,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
  message: {
    icon: MessageSquare,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
}

async function getNotifications() {
  // В реальном приложении здесь будет API запрос
  return [
    {
      id: "1",
      title: "Новый курс доступен",
      message: "Начните изучение курса 'Современное птицеводство'",
      read: false,
      createdAt: new Date(),
      type: "course",
    },
    {
      id: "2",
      title: "Достижение разблокировано",
      message: "Поздравляем! Вы получили достижение 'Первые шаги'",
      read: false,
      createdAt: new Date(Date.now() - 86400000),
      type: "achievement",
    },
    {
      id: "3",
      title: "Новое сообщение",
      message: "У вас новое сообщение от преподавателя",
      read: true,
      createdAt: new Date(Date.now() - 172800000),
      type: "message",
    },
  ]
}

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/login")
  }

  const notifications = await getNotifications()

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Уведомления</h1>
            <Badge variant="secondary" className="ml-2">
              {notifications.filter(n => !n.read).length}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Check className="h-4 w-4 mr-2" />
              Прочитать все
            </Button>
            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Очистить
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {notifications.map((notification) => {
            const type = notificationTypes[notification.type as keyof typeof notificationTypes]
            const Icon = type.icon

            return (
              <Card 
                key={notification.id} 
                className={`transition-all hover:shadow-md ${!notification.read ? 'border-l-4 border-l-primary' : ''}`}
              >
                <CardContent className="flex items-start gap-4 p-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${type.bgColor}`}>
                    <Icon className={`h-5 w-5 ${type.color}`} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{notification.title}</p>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                      </div>
                      {!notification.read && (
                        <Badge variant="secondary" className="ml-2">Новое</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(notification.createdAt)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}

