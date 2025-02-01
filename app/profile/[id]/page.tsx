import { Metadata } from "next"
import { getServerSession } from "next-auth/next"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { AddFriendButton } from "@/components/add-friend-button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CourseProgressWrapper from "./_components/course-progress-wrapper"
import ActivityFeedWrapper from "./_components/activity-feed-wrapper"
import UserAchievementsWrapper from "./_components/user-achievements-wrapper"
import { BookOpen, Trophy, Star, Users2, Calendar } from "lucide-react"
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Suspense } from "react"
import { auth } from "@/lib/auth"
import type { User, Activity, Achievement } from "@/types/prisma"
import ProfileContent from './_components/profile-content'

interface ProfilePageProps {
  params: {
    id: string
  }
}

type FriendshipStatus = 'NONE' | 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'SELF'

async function getProfileData(userId: string) {
  const userData = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      authoredCourses: true,
      enrolledCourses: true,
      courseProgress: true,
      sentFriendships: {
        include: {
          receiver: true
        }
      },
      receivedFriendships: {
        include: {
          sender: true
        }
      },
      courseRatings: true,
      userAchievements: {
        include: {
          achievement: true
        }
      }
    }
  })

  if (!userData) return null

  return userData
}

async function getFriendshipStatus(userId: string, targetUserId: string): Promise<FriendshipStatus> {
  const friendship = await prisma.friendship.findFirst({
    where: {
      OR: [
        { senderId: userId, receiverId: targetUserId },
        { senderId: targetUserId, receiverId: userId }
      ]
    }
  })

  return (friendship?.status as FriendshipStatus) || 'NONE'
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const profileData = await getProfileData(params.id)
  if (!profileData) notFound()

  const isOwnProfile = session.user.id === params.id
  const friendshipStatus = isOwnProfile ? 'SELF' : 
    await getFriendshipStatus(session.user.id, params.id)

  // Обновим типы в соответствии с Prisma схемой
  type Progress = {
    id: string;
    userId: string;
    courseId: string;
    progress: number;
    totalTimeSpent: number;
    completedAt: Date | null;
    lastAccessedAt: Date;
  }

  type CourseRating = {
    id: string;
    courseId: string;
    userId: string;
    rating: number;
  }

  // Используем правильные типы и проверки
  const completedCourses = profileData.courseProgress.filter(
    (p: Progress) => p.progress === 100 || p.completedAt !== null
  ).length;

  const totalFriends = [...(profileData.sentFriendships || []), ...(profileData.receivedFriendships || [])].length;

  const averageRating = profileData.courseRatings.reduce(
    (acc: number, curr: CourseRating) => acc + curr.rating, 0
  ) / (profileData.courseRatings.length || 1);

  const achievements = profileData.userAchievements.length

  return (
    <div className="container py-8 space-y-8">
      {/* Профиль и статистика */}
      <Card className="overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary to-primary/60" />
        <CardContent className="relative pt-0">
          <div className="flex flex-col md:flex-row gap-6 -mt-16">
            <Avatar className="w-32 h-32 border-4 border-background">
              <AvatarImage src={profileData.image || ''} alt={profileData.name || ''} />
              <AvatarFallback>{profileData.name?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold">{profileData.name}</h1>
                  <p className="text-muted-foreground">{profileData.email}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    На сайте с {formatDistanceToNow(new Date(profileData.createdAt), { 
                      addSuffix: true, locale: ru 
                    })}
                  </p>
                </div>
                {!isOwnProfile && (
                  <AddFriendButton 
                    targetUserId={params.id} 
                    initialStatus={friendshipStatus}
                  />
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard icon={BookOpen} title="Курсов пройдено" value={Number(completedCourses)} />
                <StatCard icon={Trophy} title="Достижений" value={Number(achievements)} />
                <StatCard icon={Star} title="Средний рейтинг" value={Number(averageRating.toFixed(1))} />
                <StatCard icon={Users2} title="Друзей" value={Number(totalFriends)} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Вкладки с контентом */}
      <Tabs defaultValue="progress" className="space-y-6">
        <TabsList>
          <TabsTrigger value="progress">Прогресс обучения</TabsTrigger>
          <TabsTrigger value="achievements">Достижения</TabsTrigger>
          <TabsTrigger value="activity">Активность</TabsTrigger>
          {isOwnProfile && <TabsTrigger value="friends">Друзья</TabsTrigger>}
        </TabsList>

        <TabsContent value="progress" className="space-y-6">
          <Suspense fallback={<div>Загрузка...</div>}>
            <ProfileContent userId={params.id} tab="progress" />
          </Suspense>
        </TabsContent>

        <TabsContent value="achievements">
          <Suspense fallback={<div>Загрузка...</div>}>
            <ProfileContent userId={params.id} tab="achievements" />
          </Suspense>
        </TabsContent>

        <TabsContent value="activity">
          <Suspense fallback={<div>Загрузка...</div>}>
            <ProfileContent userId={params.id} tab="activity" />
          </Suspense>
        </TabsContent>

        {isOwnProfile && (
          <TabsContent value="friends">
            <FriendsList 
              sentFriendships={profileData.sentFriendships}
              receivedFriendships={profileData.receivedFriendships}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}

function StatCard({ icon: Icon, title, value }: { icon: any; title: string; value: number }) {
  return (
    <div className="flex gap-2 items-center p-4 rounded-lg bg-muted/50">
      <Icon className="w-5 h-5 text-primary" />
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  )
}

function FriendsList({ sentFriendships, receivedFriendships }: any) {
  const friends = [...sentFriendships, ...receivedFriendships]
    .filter(f => f.status === 'ACCEPTED')
    .map(f => f.sender || f.receiver)

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {friends.map(friend => (
        <Card key={friend.id}>
          <CardContent className="flex items-center gap-4 p-4">
            <Avatar>
              <AvatarImage src={friend.image || ''} />
              <AvatarFallback>{friend.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{friend.name}</p>
              <p className="text-sm text-muted-foreground">{friend.email}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 