"use client"

import { Award, Star, Trophy, Target } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const achievements = [
  {
    icon: Star,
    title: "Первые шаги",
    description: "Завершите первый курс",
    earned: true,
  },
  {
    icon: Trophy,
    title: "Эксперт",
    description: "Завершите 10 курсов",
    earned: false,
    progress: 3,
  },
  {
    icon: Target,
    title: "Целеустремленный",
    description: "30 дней подряд обучения",
    earned: false,
    progress: 15,
  },
]

export function Achievements() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          Достижения
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {achievements.map((achievement) => (
          <div key={achievement.title} className="flex items-center gap-4">
            <div className={`p-2 rounded-lg ${achievement.earned ? 'bg-primary/10' : 'bg-muted'}`}>
              <achievement.icon className={`h-5 w-5 ${achievement.earned ? 'text-primary' : 'text-muted-foreground'}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="font-medium">{achievement.title}</p>
                {achievement.earned && (
                  <Badge variant="secondary">Получено</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{achievement.description}</p>
              {!achievement.earned && achievement.progress && (
                <p className="text-sm text-primary">{achievement.progress}/10</p>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
} 