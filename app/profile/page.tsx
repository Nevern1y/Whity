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

export const metadata: Metadata = {
  title: "Профиль | Аллель Агро",
  description: "Управление профилем пользователя",
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
  })

  if (!userData) return null

  // Вычисляем статистику
  const stats = {
    completedCourses: userData.courseProgress.filter(p => p.completedAt !== null).length,
    totalFriends: userData.sentFriendships.length + userData.receivedFriendships.length,
    averageRating: userData.courseRatings.length > 0
      ? (userData.courseRatings.reduce((acc, curr) => acc + curr.rating, 0) / userData.courseRatings.length).toFixed(1)
      : "0.0",
    achievements: userData.userAchievements.length,
    totalProgress: userData.courseProgress.length > 0
      ? userData.courseProgress.reduce((acc, curr) => acc + curr.totalTimeSpent, 0) / userData.courseProgress.length
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

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/login")

  const profileData = await getProfileData(session.user.id)
  if (!profileData) return null

  return (
    <div className="container py-8">
      {/* Верхняя секция профиля */}
      <div className="mb-8 bg-card rounded-lg p-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
          {/* Аватар и основная информация */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <ProfilePhotoUpload currentPhotoUrl={profileData.user.image} />
            <div className="text-center md:text-left">
              <h1 className="text-2xl font-bold">{profileData.user.name}</h1>
              <p className="text-muted-foreground">{profileData.user.email}</p>
            </div>
          </div>

          {/* Обновленная статистика с реальными данными */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard 
              icon={BookOpen} 
              title="Курсов пройдено" 
              value={profileData.stats.completedCourses.toString()} 
            />
            <StatCard 
              icon={Trophy} 
              title="Достижений" 
              value={profileData.stats.achievements.toString()} 
            />
            <StatCard 
              icon={Star} 
              title="Рейтинг" 
              value={profileData.stats.averageRating} 
            />
            <StatCard 
              icon={Users2} 
              title="Друзей" 
              value={profileData.stats.totalFriends.toString()} 
            />
          </div>
        </div>
      </div>

      {/* Основной контент */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Левая колонка */}
        <div className="md:col-span-2 space-y-6">
          {/* Текущий прогресс */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Текущий прогресс обучения
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div>Загрузка...</div>}>
                {/* @ts-expect-error Async Server Component */}
                <CourseProgressWrapper userId={session.user.id} />
              </Suspense>
            </CardContent>
          </Card>

          {/* Активность */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Последняя активность
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div>Загрузка...</div>}>
                {/* @ts-expect-error Async Server Component */}
                <ActivityFeedWrapper userId={session.user.id} />
              </Suspense>
            </CardContent>
          </Card>
        </div>

        {/* Правая колонка */}
        <div className="space-y-6">
          <FriendRequests />
          {/* Достижения */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Достижения
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div>Загрузка...</div>}>
                {/* @ts-expect-error Async Server Component */}
                <UserAchievementsWrapper userId={session.user.id} />
              </Suspense>
            </CardContent>
          </Card>

          {/* Сертификаты */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                Сертификаты
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Здесь будет список сертификатов */}
                <p className="text-muted-foreground text-sm">
                  Пока нет полученных сертификатов
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
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

