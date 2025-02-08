"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  BookOpen, Trophy, Star, Users2, Activity, 
  Calendar, Target, Award, Clock, CheckCircle2
} from "lucide-react"
import { Session } from "next-auth"
import { formatDistanceToNow, format } from "date-fns"
import { ru } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { socketClient } from "@/lib/socket-client"

interface ProfilePageContentProps {
  userId: string
  session: Session | null
  initialData?: ProfileData
}

interface FriendUser {
  id: string
  name: string | null
  email: string | null
  image: string | null
}

interface SentFriendship {
  id: string
  status: string
  receiver: FriendUser
}

interface ReceivedFriendship {
  id: string
  status: string
  sender: FriendUser
}

interface ProfileData {
  id: string
  name: string | null
  email: string | null
  image: string | null
  createdAt: Date
  friendshipStatus: string
  isOwnProfile: boolean
  courseProgress: Array<{
    completedAt: Date | null
    progress: number
  }>
  userAchievements: Array<{
    id: string
    achievement: any
  }>
  courseRatings: Array<{
    rating: number
  }>
  sentFriendships: SentFriendship[]
  receivedFriendships: ReceivedFriendship[]
}

interface UserStats {
  totalStudyTime: number
  completedCourses: number
  achievements: number
  averageRating: number
  totalFriends: number
  recentActivity: Array<{
    id: string
    type: string
    description: string
    date: Date
  }>
}

function StatCard({ icon: Icon, title, value }: { icon: any; title: string; value: number }) {
  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-transparent rounded-xl transition-opacity opacity-0 group-hover:opacity-100" />
      <div className="relative p-6 rounded-xl bg-gradient-to-br from-background/80 to-background/40 backdrop-blur-sm border border-orange-100/20 dark:border-orange-400/10">
        <div className="flex flex-col items-center text-center">
          <div className="p-3 rounded-xl bg-orange-100/80 dark:bg-orange-500/10 mb-3 transition-transform group-hover:scale-110">
            <Icon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </div>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-2xl font-bold bg-gradient-to-br from-orange-600 to-orange-500 dark:from-orange-400 dark:to-orange-300 bg-clip-text text-transparent">{value}</p>
        </div>
      </div>
    </div>
  )
}

function ProfileAvatar({ src, fallback }: { src: string | null, fallback: string }) {
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  return (
    <div className="relative">
      <div className={cn(
        "absolute inset-0 rounded-full",
        isLoading && "animate-pulse bg-muted"
      )} />
      <Avatar className="w-32 h-32 border-4 border-background shadow-xl">
        {!imageError && src && (
          <AvatarImage
            src={src}
            onLoad={() => setIsLoading(false)}
            onError={() => setImageError(true)}
            className="object-cover"
          />
        )}
        <AvatarFallback
          className={cn(
            "text-2xl font-semibold bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-900 dark:to-orange-800",
            !imageError && src && "hidden"
          )}
        >
          {fallback}
        </AvatarFallback>
      </Avatar>
    </div>
  )
}

function AchievementCard({ achievement }: { achievement: any }) {
  const progress = achievement.progress || 0
  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-transparent rounded-xl transition-opacity opacity-0 group-hover:opacity-100" />
      <div className="relative p-6 rounded-xl bg-gradient-to-br from-background/80 to-background/40 backdrop-blur-sm border border-orange-100/20 dark:border-orange-400/10">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-orange-100/80 dark:bg-orange-500/10 transition-transform group-hover:scale-110">
            <Award className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-sm">{achievement.achievement.title}</h4>
            <p className="text-sm text-muted-foreground">{achievement.achievement.description}</p>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Прогресс</span>
                <span className="font-medium">{Math.round(progress * 100)}%</span>
              </div>
              <Progress value={progress * 100} className="h-1.5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ActivityItem({ activity }: { activity: any }) {
  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-transparent rounded-xl transition-opacity opacity-0 group-hover:opacity-100" />
      <div className="relative p-4 rounded-xl bg-gradient-to-br from-background/80 to-background/40 backdrop-blur-sm border border-orange-100/20 dark:border-orange-400/10">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-xl bg-orange-100/80 dark:bg-orange-500/10 transition-transform group-hover:scale-110">
            <Activity className="w-4 h-4 text-orange-600 dark:text-orange-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{activity.type}</p>
            <p className="text-sm text-muted-foreground">{activity.description}</p>
          </div>
          <time className="text-sm text-muted-foreground">
            {formatDistanceToNow(new Date(activity.date), { addSuffix: true, locale: ru })}
          </time>
        </div>
      </div>
    </div>
  )
}

function FriendCard({ friend }: { friend: any }) {
  const [imageError, setImageError] = useState(false)
  const [isImageLoaded, setIsImageLoaded] = useState(false)

  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-transparent rounded-xl transition-opacity opacity-0 group-hover:opacity-100" />
      <div className="relative p-4 rounded-xl bg-gradient-to-br from-background/80 to-background/40 backdrop-blur-sm border border-orange-100/20 dark:border-orange-400/10">
        <div className="flex items-center gap-4">
          <Avatar>
            {friend.image && !imageError ? (
              <AvatarImage
                src={friend.image}
                onLoad={() => setIsImageLoaded(true)}
                onError={() => setImageError(true)}
              />
            ) : (
              <AvatarFallback className="bg-orange-100 dark:bg-orange-900">
                {friend.name?.[0] || '?'}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{friend.name}</p>
            <p className="text-sm text-muted-foreground truncate">{friend.email}</p>
          </div>
          <div className={cn(
            "w-2 h-2 rounded-full",
            friend.isOnline ? "bg-green-500" : "bg-gray-300"
          )} />
        </div>
      </div>
    </div>
  )
}

export function ProfilePageContent({ userId, session, initialData }: ProfilePageContentProps) {
  const [profileData, setProfileData] = useState<ProfileData | null>(initialData || null)
  const [isLoading, setIsLoading] = useState(!initialData)
  const [stats, setStats] = useState<UserStats | null>(null)

  useEffect(() => {
    if (initialData) {
      setProfileData(initialData)
      return
    }

    async function loadProfileData() {
      try {
        const response = await fetch(`/api/users/${userId}`)
        if (!response.ok) throw new Error('Failed to load profile')
        const data = await response.json()
        setProfileData(data)
      } catch (error) {
        console.error('Error loading profile:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadProfileData()
  }, [userId, initialData])

  useEffect(() => {
    if (!userId) return

    async function loadStats() {
      try {
        const response = await fetch(`/api/users/${userId}/stats`)
        if (!response.ok) throw new Error('Failed to load stats')
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error('Error loading stats:', error)
      }
    }

    loadStats()

    const socket = socketClient.getSocket()
    
    socket.emit('join_user_stats', userId)

    socket.on('stats_update', (data: UserStats) => {
      setStats(data)
    })

    return () => {
      socket.emit('leave_user_stats', userId)
      socket.off('stats_update')
    }
  }, [userId])

  if (isLoading || !profileData || !stats) {
    return (
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
    )
  }

  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-transparent">
            <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px]" />
          </div>
        </div>

        <div className="relative p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={BookOpen} title="Курсов пройдено" value={stats.completedCourses} />
            <StatCard icon={Trophy} title="Достижений" value={stats.achievements} />
            <StatCard icon={Star} title="Средний рейтинг" value={Number(stats.averageRating.toFixed(1))} />
            <StatCard icon={Users2} title="Друзей" value={stats.totalFriends} />
          </div>
        </div>
      </Card>

      <Tabs defaultValue="progress" className="space-y-6">
        <TabsList className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <TabsTrigger value="progress" className="data-[state=active]:bg-orange-50 dark:data-[state=active]:bg-orange-500/10">
            <Target className="w-4 h-4 mr-2" />
            Прогресс
          </TabsTrigger>
          <TabsTrigger value="achievements" className="data-[state=active]:bg-orange-50 dark:data-[state=active]:bg-orange-500/10">
            <Trophy className="w-4 h-4 mr-2" />
            Достижения
          </TabsTrigger>
          <TabsTrigger value="activity" className="data-[state=active]:bg-orange-50 dark:data-[state=active]:bg-orange-500/10">
            <Activity className="w-4 h-4 mr-2" />
            Активность
          </TabsTrigger>
          {profileData.isOwnProfile && (
            <TabsTrigger value="friends" className="data-[state=active]:bg-orange-50 dark:data-[state=active]:bg-orange-500/10">
              <Users2 className="w-4 h-4 mr-2" />
              Друзья
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="progress">
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Прогресс обучения</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Последнее обновление: {format(new Date(), 'dd.MM.yyyy')}</span>
                </div>
              </div>
              
              <div className="space-y-6">
                {profileData.courseProgress.map((course, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-orange-100/80 dark:bg-orange-500/10">
                          <BookOpen className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                        </div>
                        <span className="font-medium">Курс {index + 1}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {course.completedAt ? (
                          <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                            <CheckCircle2 className="w-4 h-4" />
                            Завершен
                          </div>
                        ) : (
                          `${Math.round(course.progress * 100)}%`
                        )}
                      </span>
                    </div>
                    <Progress value={course.progress * 100} className="h-2" />
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="achievements">
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Достижения</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {profileData.userAchievements.map((achievement) => (
                  <AchievementCard key={achievement.id} achievement={achievement} />
                ))}
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Недавняя активность</h3>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {stats.recentActivity.map((activity) => (
                    <ActivityItem key={activity.id} activity={activity} />
                  ))}
                </div>
              </ScrollArea>
            </div>
          </Card>
        </TabsContent>

        {profileData.isOwnProfile && (
          <TabsContent value="friends">
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Друзья</h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    ...profileData.sentFriendships.map(f => ({ ...f, type: 'sent' as const })),
                    ...profileData.receivedFriendships.map(f => ({ ...f, type: 'received' as const }))
                  ]
                    .filter(f => f.status === 'ACCEPTED')
                    .map((friendship) => {
                      const friend = friendship.type === 'sent' 
                        ? friendship.receiver 
                        : friendship.sender
                      return (
                        <FriendCard 
                          key={friendship.id} 
                          friend={friend}
                        />
                      )
                    })}
                </div>
              </div>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
} 