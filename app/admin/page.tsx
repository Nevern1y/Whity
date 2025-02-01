"use client"

import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Activity } from "lucide-react"

type Activity = {
  id: number
  action: string
  timestamp: string
}

async function getAdminData() {
  const [userCount, courseCount, articleCount] = await Promise.all([
    prisma.user.count(),
    prisma.course.count(),
    prisma.article.count(),
  ])
  return { userCount, courseCount, articleCount }
}

async function getRecentActivities() {
  // This is a placeholder. In a real application, you would fetch this data from your database.
  return [
    { id: 1, action: "Новый пользователь зарегистрирован", timestamp: new Date().toISOString() },
    { id: 2, action: "Курс 'Основы птицеводства' обновлен", timestamp: new Date().toISOString() },
    { id: 3, action: "Новая статья добавлена в базу знаний", timestamp: new Date().toISOString() },
  ]
}

export default async function AdminPage() {
  const session = await auth()

  if (!session || session.user.role !== "ADMIN") {
    redirect("/")
  }

  const { userCount, courseCount, articleCount } = await getAdminData()
  const recentActivities = await getRecentActivities()

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-6">Панель администратора</h1>
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Пользователи</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{userCount}</p>
            <Link href="/admin/users" className="block">
              <Button className="w-full h-32 text-lg">
                <div className="flex flex-col items-center">
                  <span>Пользователи</span>
                  <span className="text-sm text-muted-foreground">Управление пользователями</span>
                </div>
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Курсы</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{courseCount}</p>
            <Link href="/admin/courses" className="block">
              <Button className="w-full h-32 text-lg">
                <div className="flex flex-col items-center">
                  <span>Курсы</span>
                  <span className="text-sm text-muted-foreground">Управление курсами</span>
                </div>
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Статьи</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{articleCount}</p>
            <Link href="/admin/articles" className="block">
              <Button className="w-full h-32 text-lg">
                <div className="flex flex-col items-center">
                  <span>Статьи</span>
                  <span className="text-sm text-muted-foreground">Управление статьями</span>
                </div>
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-2xl font-bold mb-4">Недавние действия</h2>
      <Card>
        <CardContent className="p-0">
          <ul className="divide-y divide-gray-200">
            {recentActivities.map((activity: Activity) => (
              <li key={activity.id} className="flex items-center p-4">
                <Activity className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500">{new Date(activity.timestamp).toLocaleString()}</p>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

