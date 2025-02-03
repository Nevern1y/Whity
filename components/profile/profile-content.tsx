"use client"

import { motion } from "framer-motion"
import { StatsCards } from "@/components/profile/stats-cards"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Trophy, Target, Award, ArrowUp } from "lucide-react"

interface ProfileContentProps {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    role: string;
  };
  stats: {
    completedCourses: number;
    totalFriends: number;
    averageRating: string;
    achievements: number;
    totalProgress: number;
    currentStreak: number;
    totalTimeSpent: number;
    certificatesEarned: number;
  };
}

export function ProfileContent({ user, stats }: ProfileContentProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      {/* Статистика */}
      <div className="mb-8">
        <StatsCards stats={stats} />
      </div>

      {/* Вкладки с контентом */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="achievements">Достижения</TabsTrigger>
          <TabsTrigger value="activity">Активность</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
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

        <TabsContent value="achievements">
          {stats.achievements === 0 ? (
            <Card className="p-6 text-center">
              <Trophy className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
              <p className="text-muted-foreground">Пока нет достижений</p>
              <p className="text-sm text-muted-foreground">
                Начните проходить курсы, чтобы получить первые достижения
              </p>
            </Card>
          ) : null}
        </TabsContent>

        <TabsContent value="activity">
          {/* Добавьте график активности здесь */}
        </TabsContent>
      </Tabs>
    </motion.div>
  )
} 