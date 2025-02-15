"use client"

const { m } = useAnimation()
import { useAnimation } from "@/components/providers/animation-provider"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Trophy, Star, Users2 } from "lucide-react"

interface StatsCardsProps {
  stats: {
    completedCourses: number;
    achievements: number;
    averageRating: string;
    totalFriends: number;
  }
}

export function StatsCards({ stats }: StatsCardsProps) {
  const statCards = [
    { icon: BookOpen, label: "Курсов пройдено", value: stats.completedCourses },
    { icon: Trophy, label: "Достижений", value: stats.achievements },
    { icon: Star, label: "Рейтинг", value: stats.averageRating },
    { icon: Users2, label: "Друзей", value: stats.totalFriends }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <m.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </m.div>
      ))}
    </div>
  )
} 