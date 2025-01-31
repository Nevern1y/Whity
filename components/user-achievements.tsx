"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Trophy } from "lucide-react"

interface Achievement {
  id: string
  title: string
  description: string
  type: string
}

interface UserAchievementsProps {
  achievements: Array<{
    achievement: Achievement
  }>
}

export function UserAchievements({ achievements }: UserAchievementsProps) {
  if (!achievements.length) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Нет достижений
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {achievements.map(({ achievement }) => (
        <Card key={achievement.id} className="group hover:border-primary transition-colors">
          <CardContent className="p-4 flex items-start gap-4">
            <div className="rounded-full p-2 bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Trophy className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">{achievement.title}</h3>
              <p className="text-sm text-muted-foreground">{achievement.description}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

