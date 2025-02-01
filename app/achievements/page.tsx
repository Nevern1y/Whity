import { Metadata } from "next"
import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { ACHIEVEMENTS } from "@/lib/achievements"
import { AchievementCard } from "@/components/achievements/achievement-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Clock, Flame } from "lucide-react"
import { StatsCard } from "@/components/achievements/stats-card"
import { auth } from "@/lib/auth"

interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  progress: number;
  completed: boolean;
  earnedAt: Date | null;
  achievement: {
    id: string;
    title: string;
    description: string;
    icon: string;
  };
}

export const metadata: Metadata = {
  title: "Достижения | Аллель Агро",
  description: "Ваши достижения на платформе",
}

export default async function AchievementsPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const userAchievements = await prisma.userAchievement.findMany({
    where: { userId: session.user.id },
    include: { achievement: true }
  }) as UserAchievement[]

  const stats = await prisma.userStatistics.findUnique({
    where: { userId: session.user.id }
  })

  const achievementsByCategory = {
    courses: Object.values(ACHIEVEMENTS).filter(a => a.type.includes("COURSE")),
    time: Object.values(ACHIEVEMENTS).filter(a => a.type.includes("TIME")),
    special: Object.values(ACHIEVEMENTS).filter(a => !a.type.includes("COURSE") && !a.type.includes("TIME"))
  }

  return (
    <div className="container py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Достижения</h1>
        <p className="text-muted-foreground">
          Отслеживайте свой прогресс и получайте награды за успехи в обучении
        </p>
      </div>

      {/* Обновленная статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          title="Всего достижений"
          value={userAchievements.filter((ua: UserAchievement) => ua.completed).length}
          total={Object.keys(ACHIEVEMENTS).length}
          icon={<Trophy className="h-6 w-6" />}
        />
        <StatsCard
          title="Текущая серия"
          value={stats?.currentStreak || 0}
          unit="дней"
          icon={<Flame className="h-6 w-6" />}
          delay={0.1}
        />
        <StatsCard
          title="Время обучения"
          value={Math.floor((stats?.totalTimeSpent || 0) / 60)}
          unit="ч"
          icon={<Clock className="h-6 w-6" />}
          delay={0.2}
        />
      </div>

      {/* Достижения по категориям */}
      <Tabs defaultValue="courses" className="space-y-4">
        <TabsList>
          <TabsTrigger value="courses">Курсы</TabsTrigger>
          <TabsTrigger value="time">Время</TabsTrigger>
          <TabsTrigger value="special">Особые</TabsTrigger>
        </TabsList>

        {Object.entries(achievementsByCategory).map(([category, achievements]) => (
          <TabsContent key={category} value={category}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map(achievement => {
                const userAchievement = userAchievements.find(
                  (ua: UserAchievement) => ua.achievementId === achievement.id
                )
                
                return (
                  <AchievementCard
                    key={achievement.id}
                    title={achievement.title}
                    description={achievement.description}
                    icon={achievement.icon}
                    progress={userAchievement?.progress || 0}
                    requirement={achievement.requirement}
                    completed={userAchievement?.completed || false}
                    earnedAt={userAchievement?.earnedAt || undefined}
                  />
                )
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
} 