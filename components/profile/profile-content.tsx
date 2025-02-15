"use client"

import { withAnimation, type WithMotionProps } from "@/components/hoc/with-animation"
import { StatsCards } from "@/components/profile/stats-cards"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Trophy, Target, Award, ArrowUp } from "lucide-react"

interface ProfileUser {
  id: string
  name: string | null
  email: string | null
  image: string | null
  role: string
  createdAt: Date | undefined
}

interface ProfileStats {
  completedCourses: number
  totalFriends: number
  averageRating: string
  achievements: number
  totalProgress: number
  currentStreak: number
  totalTimeSpent: number
  certificatesEarned: number
}

interface ProfileContentProps {
  user: ProfileUser
  stats: ProfileStats
}

function ProfileContentBase({ m, isReady, user, stats }: ProfileContentProps & WithMotionProps) {
  if (!isReady || !m) {
    return (
      <div className="space-y-8">
        <StatsCards stats={stats} />
        <Tabs defaultValue="courses" className="space-y-4">
          <TabsList>
            <TabsTrigger value="courses">Курсы</TabsTrigger>
            <TabsTrigger value="achievements">Достижения</TabsTrigger>
            <TabsTrigger value="friends">Друзья</TabsTrigger>
          </TabsList>
          <TabsContent value="courses" className="space-y-4">
            {/* Course content */}
          </TabsContent>
          <TabsContent value="achievements" className="space-y-4">
            {/* Прогресс обучения */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Прогресс обучения</h3>
                <span className="text-sm text-muted-foreground">
                  {Math.round(stats.totalProgress * 100)}%
                </span>
              </div>
              <Progress value={stats.totalProgress * 100} className="h-2" />
            </Card>

            {/* Текущие цели */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Текущие цели</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <ArrowUp className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="font-medium">Серия: {stats.currentStreak} дней</p>
                    <p className="text-sm text-muted-foreground">
                      Продолжайте учиться каждый день
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Award className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium">
                      Сертификатов: {stats.certificatesEarned}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Заработано за все время
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
          <TabsContent value="friends" className="space-y-4">
            {/* Friends content */}
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  const MotionDiv = m.div

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <StatsCards stats={stats} />
      <Tabs defaultValue="courses" className="space-y-4">
        <TabsList>
          <TabsTrigger value="courses">Курсы</TabsTrigger>
          <TabsTrigger value="achievements">Достижения</TabsTrigger>
          <TabsTrigger value="friends">Друзья</TabsTrigger>
        </TabsList>
        <TabsContent value="courses" className="space-y-4">
          {/* Course content */}
        </TabsContent>
        <TabsContent value="achievements" className="space-y-4">
          {/* Прогресс обучения */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Прогресс обучения</h3>
              <span className="text-sm text-muted-foreground">
                {Math.round(stats.totalProgress * 100)}%
              </span>
            </div>
            <Progress value={stats.totalProgress * 100} className="h-2" />
          </Card>

          {/* Текущие цели */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Текущие цели</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <ArrowUp className="h-8 w-8 text-green-500" />
                <div>
                  <p className="font-medium">Серия: {stats.currentStreak} дней</p>
                  <p className="text-sm text-muted-foreground">
                    Продолжайте учиться каждый день
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Award className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">
                    Сертификатов: {stats.certificatesEarned}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Заработано за все время
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
        <TabsContent value="friends" className="space-y-4">
          {/* Friends content */}
        </TabsContent>
      </Tabs>
    </MotionDiv>
  )
}

export const ProfileContent = withAnimation(ProfileContentBase) 