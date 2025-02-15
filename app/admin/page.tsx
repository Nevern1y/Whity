"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users, BookOpen, FileText, Activity,
  TrendingUp, UserPlus, BookMarked, FileUp
} from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Progress } from "@/components/ui/progress"

interface Stats {
  users: {
    total: number
    active: number
    newToday: number
    growth: number
  }
  courses: {
    total: number
    published: number
    inProgress: number
    averageRating: number
  }
  articles: {
    total: number
    published: number
    draft: number
    views: number
  }
  activities: Activity[]
}

interface Activity {
  id: string
  type: string
  description: string
  metadata: any
  timestamp: Date
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function loadStats() {
      try {
        const response = await fetch('/api/admin/stats')
        if (!response.ok) throw new Error('Failed to load stats')
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error('Error loading stats:', error)
        toast.error('Не удалось загрузить статистику')
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [])

  if (isLoading || !stats) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                    <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Пользователи
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">{stats.users.total}</div>
              <div className="text-xs text-muted-foreground">
                +{stats.users.newToday} сегодня
              </div>
              <Progress value={stats.users.growth} className="h-1" />
            </div>
            <Button 
              variant="ghost" 
              className="w-full mt-4"
              onClick={() => router.push('/admin/users')}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Управление
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Курсы
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">{stats.courses.total}</div>
              <div className="text-xs text-muted-foreground">
                {stats.courses.published} опубликовано
              </div>
              <Progress 
                value={(stats.courses.published / stats.courses.total) * 100} 
                className="h-1" 
              />
            </div>
            <Button 
              variant="ghost" 
              className="w-full mt-4"
              onClick={() => router.push('/admin/courses')}
            >
              <BookMarked className="h-4 w-4 mr-2" />
              Управление
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Статьи
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">{stats.articles.total}</div>
              <div className="text-xs text-muted-foreground">
                {stats.articles.views} просмотров
              </div>
              <Progress 
                value={(stats.articles.published / stats.articles.total) * 100} 
                className="h-1" 
              />
            </div>
            <Button 
              variant="ghost" 
              className="w-full mt-4"
              onClick={() => router.push('/admin/articles')}
            >
              <FileUp className="h-4 w-4 mr-2" />
              Управление
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Активность
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.activities.slice(0, 3).map((activity) => (
                <div key={activity.id} className="flex items-center text-sm">
                  <Activity className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="truncate">{activity.description}</span>
                </div>
              ))}
            </div>
            <Button 
              variant="ghost" 
              className="w-full mt-4"
              onClick={() => router.push('/admin/activity')}
            >
              Показать все
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Последние действия</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.activities.map((activity) => (
              <div 
                key={activity.id} 
                className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
              >
                <div className="flex items-center space-x-4">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium leading-none">
                      {activity.description}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="ml-4">
                  <Button variant="ghost" size="sm">
                    Подробнее
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

