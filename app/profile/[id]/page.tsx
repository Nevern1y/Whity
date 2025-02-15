"use client"

import { Metadata } from "next"
import { getServerSession } from "next-auth/next"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { AddFriendButton } from "@/components/add-friend-button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Trophy, Star, Users2, Calendar, Settings, Shield, Trash2 } from "lucide-react"
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Suspense, useEffect, useState } from "react"
import { auth } from "@/auth"
import type { User, Activity, Achievement } from "@/types/prisma"
import { ProfileContent } from './_components/profile-content'
import { Badge } from "@/components/ui/badge"
import { FriendActionButton } from "@/components/friend-action-button"
import { FriendshipValidator } from "@/lib/friendship-validator"
import type { FriendshipStatus } from "@/types/friends"
import { ExtendedFriendshipStatus } from "@/lib/constants"
import { useSession } from "next-auth/react"
import { DashboardButton } from "@/components/dashboard/dashboard-button"
import { useRouter } from "next/navigation"
import { useAnimation } from "@/components/providers/animation-provider"
import { FriendsList } from "./_components/friends-list"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface ProfilePageProps {
  params: {
    id: string
  }
}

interface Progress {
  id: string
  userId: string
  courseId: string
  progress: number
  totalTimeSpent: number
  completedAt: Date | null
  lastAccessedAt: Date
}

interface CourseRating {
  id: string
  courseId: string
  userId: string
  rating: number
}

function StatCard({ icon: Icon, title, value }: { icon: any; title: string; value: number }) {
  return (
    <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-muted/50 text-center">
      <Icon className="w-6 h-6 text-primary mb-2" />
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  )
}

function AdminActions({ userId, userRole }: { userId: string, userRole: string }) {
  const router = useRouter()

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => router.push(`/admin/users?userId=${userId}`)}
      >
        <Shield className="h-4 w-4 mr-2" />
        Управление пользователем
      </Button>
      {userRole !== 'ADMIN' && (
        <Button
          variant="destructive"
          size="sm"
          onClick={() => router.push(`/admin/users?action=delete&userId=${userId}`)}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Удалить пользователя
        </Button>
      )}
    </div>
  )
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const { data: session } = useSession()
  const [error, setError] = useState<string | null>(null)
  const [profileData, setProfileData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const isOwnProfile = session?.user?.id === params.id

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch(`/api/users/${params.id}`)
        if (!response.ok) {
          if (response.status === 404) {
            setError("Пользователь не найден")
          } else {
            setError("Ошибка загрузки профиля")
          }
          return
        }
        const data = await response.json()
        setProfileData(data)
      } catch (err) {
        setError("Произошла ошибка при загрузке профиля")
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [params.id])

  if (isLoading) {
    return (
      <div className="container py-8">
        <Card className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-muted rounded-lg" />
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded-lg" />
              ))}
            </div>
          </div>
        </Card>
      </div>
    )
  }

  if (error || !profileData) {
    return (
      <div className="container py-8">
        <Card className="p-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-destructive">{error || "Ошибка"}</h2>
            <p className="text-muted-foreground mt-2">Попробуйте обновить страницу</p>
          </div>
        </Card>
      </div>
    )
  }

  const completedCourses = profileData.courseProgress?.filter(
    (p: Progress) => p.progress === 100 || p.completedAt !== null
  ).length || 0

  const totalFriends = [
    ...(profileData.sentFriendships || []), 
    ...(profileData.receivedFriendships || [])
  ].filter(f => f.status === 'ACCEPTED').length

  const averageRating = profileData.courseRatings?.length 
    ? profileData.courseRatings.reduce(
        (acc: number, curr: CourseRating) => acc + curr.rating, 
        0
      ) / profileData.courseRatings.length 
    : 0

  const achievements = profileData.userAchievements?.length || 0

  return (
    <div className="container py-8 space-y-8">
      <Card className="relative overflow-hidden">
        <div className="h-48 bg-gradient-to-br from-primary/80 to-primary/40" />
        <CardContent className="relative">
          <div className="absolute top-4 right-4">
            {!isOwnProfile && session?.user && (
              <div className="flex items-center gap-2">
                <FriendActionButton 
                  targetUserId={params.id} 
                  initialStatus={profileData.friendshipStatus}
                  isReceivedRequest={profileData.isReceivedRequest}
                />
                {["ADMIN", "MANAGER"].includes(session.user.role) && (
                  <AdminActions 
                    userId={params.id} 
                    userRole={profileData.role} 
                  />
                )}
              </div>
            )}
            {isOwnProfile && (
              <DashboardButton id={params.id} currentUserId={session?.user?.id} />
            )}
          </div>
          <div className="flex flex-col items-center -mt-20 text-center">
            <div className="relative">
              <Avatar className="w-32 h-32 border-4 border-background shadow-xl">
                <AvatarImage 
                  src={profileData.image || ''} 
                  alt={profileData.name || ''} 
                  className="h-full w-full object-cover"
                />
                <AvatarFallback>
                  {profileData.name?.[0] || '?'}
                </AvatarFallback>
              </Avatar>
              {isOwnProfile && (
                <Link
                  href="/settings"
                  className={cn(
                    "absolute bottom-0 right-0 p-2 rounded-full",
                    "bg-background border shadow-sm",
                    "text-muted-foreground hover:text-primary",
                    "transition-colors duration-200"
                  )}
                >
                  <Settings className="h-4 w-4" />
                  <span className="sr-only">Изменить фото профиля</span>
                </Link>
              )}
            </div>
            <div className="mt-4 space-y-2">
              <h1 className="text-2xl font-bold">{profileData.name}</h1>
              <p className="text-muted-foreground">{profileData.email}</p>
              <p className="text-sm text-muted-foreground">
                На сайте с {formatDistanceToNow(new Date(profileData.createdAt), { 
                  addSuffix: true, locale: ru 
                })}
              </p>
            </div>

            <div className="grid grid-cols-4 gap-8 mt-8">
              <StatCard icon={BookOpen} title="Курсов пройдено" value={completedCourses} />
              <StatCard icon={Trophy} title="Достижений" value={achievements} />
              <StatCard icon={Star} title="Средний рейтинг" value={Number(averageRating.toFixed(1))} />
              <StatCard icon={Users2} title="Друзей" value={totalFriends} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="progress" className="space-y-6">
        <TabsList>
          <TabsTrigger value="progress">Прогресс обучения</TabsTrigger>
          <TabsTrigger value="achievements">Достижения</TabsTrigger>
          <TabsTrigger value="activity">Активность</TabsTrigger>
          {isOwnProfile && <TabsTrigger value="friends">Друзья</TabsTrigger>}
        </TabsList>

        <TabsContent value="progress" className="space-y-6">
          <ProfileContent userId={params.id} tab="progress" />
        </TabsContent>

        <TabsContent value="achievements">
          <ProfileContent userId={params.id} tab="achievements" />
        </TabsContent>

        <TabsContent value="activity">
          <ProfileContent userId={params.id} tab="activity" />
        </TabsContent>

        {isOwnProfile && (
          <TabsContent value="friends">
            <FriendsList 
              allFriendships={[
                ...(profileData.sentFriendships || []),
                ...(profileData.receivedFriendships || [])
              ]}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
} 