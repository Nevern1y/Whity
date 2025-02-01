"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useSyncUserImage } from "@/hooks/use-sync-user-image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Clock, Trophy, Target, Award, ArrowUp } from "lucide-react"
import { StatsCards } from "@/components/profile/stats-cards"
import { useUserStore } from "@/lib/store/user-store"
import { toast } from "sonner"

interface CourseProgress {
  completedAt: Date | null;
  totalTimeSpent: number;
}

interface CourseRating {
  rating: number;
}

interface Friendship {
  id: string;
}

interface UserData {
  name: string | null;
  email: string | null;
  image: string | null;
  courseProgress: CourseProgress[];
  userAchievements: { id: string }[];
  sentFriendships: Friendship[];
  receivedFriendships: Friendship[];
  courseRatings: CourseRating[];
}

interface ProfileStats {
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
}

interface ProfileData {
  user: {
    name: string | null
    email: string | null
    image: string | null
  }
  stats: ProfileStats
}

export function ProfileContent() {
  const { data: session } = useSession()
  const userImage = useUserStore((state) => state.userImage)
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Используем хук синхронизации
  useSyncUserImage()

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!session?.user?.id) return;
      
      try {
        setIsLoading(true)
        const response = await fetch('/api/user/profile', {
          credentials: 'include'
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        setProfileData(data)
      } catch (error) {
        console.error('Error fetching profile:', error)
        toast.error('Ошибка при загрузке профиля')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfileData()
  }, [session?.user?.id, userImage, session?.user?.image])

  const displayImage = userImage || profileData?.user?.image || session?.user?.image

  if (isLoading) {
    return (
      <div className="container py-6 space-y-8">
        <div className="animate-pulse">
          {/* Скелетон загрузки */}
          <div className="h-24 bg-muted rounded-lg mb-4" />
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-6 space-y-8">
      {/* Профиль */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={displayImage || undefined} />
              <AvatarFallback className="text-2xl">
                {session?.user?.name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2 text-center md:text-left">
              <h1 className="text-2xl font-bold">{profileData?.user?.name || session?.user?.name}</h1>
              <p className="text-muted-foreground">{profileData?.user?.email || session?.user?.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Статистика */}
      {profileData && <StatsCards stats={profileData.stats} />}

      {/* Вкладки с детальной информацией */}
      <Tabs defaultValue="progress" className="space-y-4">
        <TabsList>
          <TabsTrigger value="progress">Прогресс обучения</TabsTrigger>
          <TabsTrigger value="achievements">Достижения</TabsTrigger>
          <TabsTrigger value="activity">Активность</TabsTrigger>
        </TabsList>

        <TabsContent value="progress">
          {profileData && (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Время обучения
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {profileData?.stats && (
                      <div className="flex justify-between">
                        <p className="text-muted-foreground">Всего часов</p>
                        <p className="font-medium">
                          {Math.floor((profileData.stats.totalStudyTime || 0) / 60)} ч
                        </p>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <p className="text-muted-foreground">Сегодня</p>
                      <div className="space-y-2">
                        <Progress value={(profileData.stats.learningGoals.progress / profileData.stats.learningGoals.daily) * 100} />
                        <p className="text-sm text-right text-muted-foreground">
                          {profileData.stats.learningGoals.progress} / {profileData.stats.learningGoals.daily} мин
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Текущие цели
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <ArrowUp className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="font-medium">Серия: {profileData.stats.currentStreak} дней</p>
                        <p className="text-sm text-muted-foreground">Продолжайте учиться каждый день</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Award className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">Сертификатов: {profileData.stats.certificatesEarned}</p>
                        <p className="text-sm text-muted-foreground">Заработано за все время</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="achievements">
          {profileData?.stats.achievements === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Trophy className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                <p className="text-muted-foreground">Пока нет достижений</p>
                <p className="text-sm text-muted-foreground">Начните проходить курсы, чтобы получить первые достижения</p>
              </CardContent>
            </Card>
          ) : null}
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardContent className="p-6">
              {/* Здесь можно добавить график активности */}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 