import { Metadata } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { UserStats } from "@/components/user-stats"
import { UserAchievements } from "@/components/user-achievements"
import { CourseProgress } from "@/components/course-progress"
import { ActivityFeed } from "@/components/activity-feed"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Camera, Mail, MapPin, Building2, Phone, Edit } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CalendarDays, Trophy, BookOpen, Clock, Star, Users2 } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { ProfilePhotoUpload } from "@/components/profile-photo-upload"
import { FriendRequests } from "@/components/friend-requests"
import { Suspense } from "react"
import CourseProgressWrapper from "./_components/course-progress-wrapper"
import ActivityFeedWrapper from "./_components/activity-feed-wrapper"
import UserAchievementsWrapper from "./_components/user-achievements-wrapper"
import { motion } from "framer-motion"
import { Award, ArrowUp, Target } from "lucide-react"
import { StatsCards } from "./_components/stats-cards"

export const metadata: Metadata = {
  title: "Профиль | Аллель Агро",
  description: "Управление профилем пользователя",
}

// Добавим интерфейсы для типизации данных
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

async function getProfileData(userId: string) {
  const userData = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      image: true,
      courseProgress: {
        select: {
          completedAt: true,
          totalTimeSpent: true
        }
      },
      userAchievements: {
        select: {
          id: true
        }
      },
      sentFriendships: {
        where: { status: 'ACCEPTED' },
        select: { id: true }
      },
      receivedFriendships: {
        where: { status: 'ACCEPTED' },
        select: { id: true }
      },
      courseRatings: {
        select: {
          rating: true
        }
      }
    }
  }) as UserData | null

  if (!userData) return null

  // Вычисляем статистику с правильной типизацией
  const stats = {
    completedCourses: userData.courseProgress.filter((p: CourseProgress) => p.completedAt !== null).length,
    totalFriends: userData.sentFriendships.length + userData.receivedFriendships.length,
    averageRating: userData.courseRatings.length > 0
      ? (userData.courseRatings.reduce((acc: number, curr: CourseRating) => acc + curr.rating, 0) / userData.courseRatings.length).toFixed(1)
      : "0.0",
    achievements: userData.userAchievements.length,
    totalProgress: userData.courseProgress.length > 0
      ? userData.courseProgress.reduce((acc: number, curr: CourseProgress) => acc + curr.totalTimeSpent, 0) / userData.courseProgress.length
      : 0
  }

  return {
    user: {
      name: userData.name,
      email: userData.email,
      image: userData.image
    },
    stats
  }
}

async function getUserStats(userId: string) {
  // Здесь должна быть логика получения статистики пользователя из БД
  return {
    coursesCompleted: 0,
    achievements: 0,
    rating: 0.0,
    friends: 0,
    totalStudyTime: 0,
    certificatesEarned: 0,
    currentStreak: 0,
    learningGoals: {
      daily: 30, // минут
      progress: 0
    }
  }
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login")

  const profileData = await getProfileData(session.user.id)
  const stats = await getUserStats(session.user.id)

  return (
    <div className="container py-6 space-y-8">
      {/* Профиль */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={profileData?.user.image || undefined} />
              <AvatarFallback className="text-2xl">
                {profileData?.user.name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2 text-center md:text-left">
              <h1 className="text-2xl font-bold">{profileData?.user.name}</h1>
              <p className="text-muted-foreground">{profileData?.user.email}</p>
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
                  <div className="flex justify-between">
                    <p className="text-muted-foreground">Всего часов</p>
                    <p className="font-medium">{Math.floor(stats.totalStudyTime / 60)} ч</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-muted-foreground">Сегодня</p>
                    <div className="space-y-2">
                      <Progress value={(stats.learningGoals.progress / stats.learningGoals.daily) * 100} />
                      <p className="text-sm text-right text-muted-foreground">
                        {stats.learningGoals.progress} / {stats.learningGoals.daily} мин
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
                      <p className="font-medium">Серия: {stats.currentStreak} дней</p>
                      <p className="text-sm text-muted-foreground">Продолжайте учиться каждый день</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Award className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">Сертификатов: {stats.certificatesEarned}</p>
                      <p className="text-sm text-muted-foreground">Заработано за все время</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="achievements">
          {stats.achievements === 0 ? (
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

// Компонент карточки статистики
function StatCard({ icon: Icon, title, value }: { icon: any; title: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Icon className="w-4 h-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{title}</p>
        </div>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  )
}

