"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  BookOpen, Trophy, Star, Users2, Clock, Target, 
  Activity, Calendar, ArrowUp, Flame 
} from "lucide-react"
import { socketClient } from "@/lib/socket-client"
import { format, formatDistanceToNow } from "date-fns"
import { ru } from "date-fns/locale"
import { motion } from "framer-motion"

interface DashboardStats {
  totalStudyTime: number
  completedCourses: number
  totalFriends: number
  achievements: number
  currentStreak: number
  totalTimeSpent: number
  averageRating: string
  totalProgress: number
  learningGoals: {
    daily: number
    progress: number
  }
  certificatesEarned: number
  recentActivity: Array<{
    id: string
    type: string
    duration: number
    createdAt: Date
  }>
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSessionChecked, setIsSessionChecked] = useState(false)

  // Handle session check and initial data load
  useEffect(() => {
    if (!session?.user) {
      router.push("/login")
      return
    }
    
    setIsSessionChecked(true)
    
    // Fetch initial data via REST API
    async function loadInitialData() {
      try {
        const response = await fetch('/api/dashboard/stats')
        if (!response.ok) throw new Error('Failed to load dashboard data')
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error('Error loading dashboard:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadInitialData()
  }, [session, router])

  // Handle real-time updates via socket
  useEffect(() => {
    if (!session?.user?.id || !isSessionChecked) return

    const socket = socketClient.getSocket()
    const userId = session.user.id

    function setupSocket() {
      socket.emit('join_dashboard', userId)

      socket.on('dashboard_update', ({ type, data }) => {
        setStats(prev => {
          if (!prev) return prev
          switch (type) {
            case 'study_time':
              return { ...prev, totalStudyTime: data.totalStudyTime }
            case 'course_progress':
              return { 
                ...prev, 
                totalProgress: data.totalProgress,
                completedCourses: data.completedCourses 
              }
            case 'achievement':
              return { ...prev, achievements: prev.achievements + 1 }
            default:
              return prev
          }
        })
      })
    }

    setupSocket()

    return () => {
      socket.emit('leave_dashboard', userId)
      socket.off('dashboard_update')
    }
  }, [session?.user?.id, isSessionChecked])

  // Show loading state
  if (!isSessionChecked || isLoading) {
    return (
      <div className="container py-8">
        <div className="h-[600px] flex items-center justify-center">
          <div className="space-y-4 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
            <p className="text-muted-foreground">Загрузка данных...</p>
          </div>
        </div>
      </div>
    )
  }

  // Show error state if no data
  if (!stats || !session?.user) return null

  return (
    <div className="container py-8 space-y-8 animate-fade-in">
      {/* Приветствие */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Добро пожаловать, {session.user.name}!
        </h1>
        <p className="text-muted-foreground">
          Отслеживайте свой прогресс и достижения
        </p>
      </div>

      {/* Основные показатели */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon={BookOpen}
          title="Пройдено курсов"
          value={stats.completedCourses}
          description="из всех курсов"
          trend={stats.totalProgress}
          trendLabel="общий прогресс"
        />
        <StatsCard
          icon={Clock}
          title="Время обучения"
          value={Math.floor(stats.totalStudyTime / 60)}
          unit="ч"
          description="всего"
          trend={stats.learningGoals.progress / stats.learningGoals.daily}
          trendLabel="сегодня"
        />
        <StatsCard
          icon={Trophy}
          title="Достижения"
          value={stats.achievements}
          description="разблокировано"
        />
        <StatsCard
          icon={Flame}
          title="Текущая серия"
          value={stats.currentStreak}
          unit="дней"
          description="подряд"
        />
      </div>

      {/* Вкладки с детальной информацией */}
      <Tabs defaultValue="progress" className="space-y-4">
        <TabsList>
          <TabsTrigger value="progress">Прогресс</TabsTrigger>
          <TabsTrigger value="activity">Активность</TabsTrigger>
          <TabsTrigger value="achievements">Достижения</TabsTrigger>
        </TabsList>

        <TabsContent value="progress">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Прогресс обучения */}
            <Card>
              <CardHeader>
                <CardTitle>Прогресс обучения</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Общий прогресс</span>
                    <span className="font-medium">{Math.round(stats.totalProgress * 100)}%</span>
                  </div>
                  <Progress value={stats.totalProgress * 100} />
                </div>
              </CardContent>
            </Card>

            {/* Цели обучения */}
            <Card>
              <CardHeader>
                <CardTitle>Цели обучения</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground">Сегодня</span>
                      <span className="text-sm font-medium">
                        {stats.learningGoals.progress} / {stats.learningGoals.daily} мин
                      </span>
                    </div>
                    <Progress 
                      value={(stats.learningGoals.progress / stats.learningGoals.daily) * 100} 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Сертификаты */}
            <Card>
              <CardHeader>
                <CardTitle>Сертификаты</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <div className="text-3xl font-bold mb-2">{stats.certificatesEarned}</div>
                  <p className="text-sm text-muted-foreground">получено сертификатов</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Недавняя активность</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {stats.recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center gap-4 p-4 rounded-lg bg-muted/50"
                    >
                      <div className="p-2 rounded-full bg-primary/10">
                        <Activity className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          Изучение материала
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {activity.duration} мин
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.createdAt), {
                          addSuffix: true,
                          locale: ru
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <AchievementCard
              icon={BookOpen}
              title="Начинающий"
              description="Завершите первый курс"
              progress={stats.completedCourses > 0 ? 100 : 0}
            />
            <AchievementCard
              icon={Clock}
              title="Усердный студент"
              description="Проведите 10 часов за обучением"
              progress={Math.min((stats.totalTimeSpent / (10 * 60)) * 100, 100)}
            />
            <AchievementCard
              icon={Flame}
              title="На волне"
              description="Поддерживайте серию 7 дней"
              progress={Math.min((stats.currentStreak / 7) * 100, 100)}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function StatsCard({ 
  icon: Icon, 
  title, 
  value, 
  unit = "", 
  description,
  trend,
  trendLabel
}: { 
  icon: any
  title: string
  value: number
  unit?: string
  description: string
  trend?: number
  trendLabel?: string
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-primary/10">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-1">
              <p className="text-2xl font-bold">{value}</p>
              {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
            </div>
            <p className="text-sm text-muted-foreground">{description}</p>
            {trend !== undefined && trendLabel && (
              <div className="mt-2">
                <Progress value={trend * 100} className="h-1" />
                <p className="text-xs text-muted-foreground mt-1">{trendLabel}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function AchievementCard({ 
  icon: Icon, 
  title, 
  description, 
  progress 
}: { 
  icon: any
  title: string
  description: string
  progress: number
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 rounded-full bg-primary/10">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="font-medium">{title}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <div className="space-y-2">
          <Progress value={progress} />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Прогресс</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

