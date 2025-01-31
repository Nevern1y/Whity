"use client"

import { Card, CardContent } from "@/components/ui/card"
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'
import { BookOpen, Trophy, Star } from "lucide-react"

interface Activity {
  id: string
  type: string
  description: string
  createdAt: Date
  metadata: any
}

interface ActivityFeedProps {
  activities: Activity[]
}

const activityIcons = {
  course_progress: BookOpen,
  achievement: Trophy,
  course_rating: Star
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  if (!activities.length) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Нет активности
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {activities.map(activity => {
        const Icon = activityIcons[activity.type as keyof typeof activityIcons]

        return (
          <Card key={activity.id}>
            <CardContent className="p-4 flex items-center gap-4">
              {Icon && <Icon className="w-5 h-5 text-primary" />}
              <div className="flex-1">
                <p>{activity.description}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true, locale: ru })}
                </p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
} 