import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Users2, Star, Trophy } from "lucide-react"

interface Stats {
  completedCourses: number
  totalFriends: number
  averageRating: string
  achievements: number
  totalProgress: number
}

interface StatsCardsProps {
  stats: Stats
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <StatCard
        icon={BookOpen}
        title="Пройдено курсов"
        value={stats.completedCourses.toString()}
      />
      <StatCard
        icon={Users2}
        title="Друзей"
        value={stats.totalFriends.toString()}
      />
      <StatCard
        icon={Star}
        title="Средняя оценка"
        value={stats.averageRating}
      />
      <StatCard
        icon={Trophy}
        title="Достижений"
        value={stats.achievements.toString()}
      />
    </div>
  )
}

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