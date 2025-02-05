"use client"

import { useState, useEffect, Suspense } from "react"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Trophy, Star, Users2 } from "lucide-react"
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'
import { AddFriendButton } from "@/components/add-friend-button"
import type { ProfileFriendshipStatus } from "../page"
import ProfileContent from './profile-content'
import { FriendsList } from "./friends-list"

interface Friend {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

interface Friendship {
  id: string;
  senderId: string;
  receiverId: string;
  status: string;
  sender?: Friend;
  receiver?: Friend;
}

interface Progress {
  id: string;
  userId: string;
  courseId: string;
  progress: number;
  totalTimeSpent: number;
  completedAt: Date | null;
  lastAccessedAt: Date;
}

interface CourseRating {
  id: string;
  courseId: string;
  userId: string;
  rating: number;
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

interface ProfilePageContentProps {
  params: { id: string }
  profileData: any
  isOwnProfile: boolean
  initialFriendshipStatus: ProfileFriendshipStatus
  children?: React.ReactNode
}

export function ProfilePageContent({
  params,
  profileData,
  isOwnProfile,
  initialFriendshipStatus,
  children
}: ProfilePageContentProps) {
  const [currentFriendshipStatus, setCurrentFriendshipStatus] = useState(initialFriendshipStatus)

  useEffect(() => {
    const handleFriendshipUpdate = (event: CustomEvent) => {
      if (event.detail.targetUserId === params.id) {
        setCurrentFriendshipStatus(event.detail.status)
      }
    }
    
    window.addEventListener('friendship-updated', handleFriendshipUpdate as EventListener)
    return () => {
      window.removeEventListener('friendship-updated', handleFriendshipUpdate as EventListener)
    }
  }, [params.id])

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
      <Card className="relative overflow-hidden">
        <div className="h-48 bg-gradient-to-br from-primary/80 to-primary/40" />
        <CardContent className="relative">
          <div className="absolute top-4 right-4">
            {!isOwnProfile && (
              <AddFriendButton 
                targetUserId={params.id} 
                initialStatus={currentFriendshipStatus}
              />
            )}
          </div>
          <div className="flex flex-col items-center -mt-20 text-center">
            <div className="shrink-0">
              <Avatar className="w-32 h-32 border-4 border-background shadow-xl">
                <AvatarImage 
                  src={profileData.image || ''} 
                  alt={profileData.name || ''} 
                  className="h-full w-full object-cover"
                />
              </Avatar>
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
              <StatCard icon={BookOpen} title="Курсов пройдено" value={Number(completedCourses)} />
              <StatCard icon={Trophy} title="Достижений" value={Number(achievements)} />
              <StatCard icon={Star} title="Средний рейтинг" value={Number(averageRating.toFixed(1))} />
              <StatCard icon={Users2} title="Друзей" value={Number(totalFriends)} />
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
              sentFriendships={profileData.sentFriendships}
              receivedFriendships={profileData.receivedFriendships}
            />
          </TabsContent>
        )}
      </Tabs>
      {children}
    </div>
  )
} 