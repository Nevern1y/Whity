"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Medal } from "lucide-react"

const rankings = [
  {
    position: 1,
    name: "Александр К.",
    points: 2500,
    avatar: "/avatars/user1.jpg",
  },
  {
    position: 2,
    name: "Елена М.",
    points: 2350,
    avatar: "/avatars/user2.jpg",
  },
  {
    position: 3,
    name: "Дмитрий С.",
    points: 2200,
    avatar: "/avatars/user3.jpg",
  },
]

export function ActivityRanking() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Medal className="h-5 w-5 text-primary" />
          Рейтинг активности
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {rankings.map((user) => (
            <div key={user.position} className="flex items-center gap-4">
              <div className="text-2xl font-bold text-muted-foreground w-8">
                #{user.position}
              </div>
              <Avatar>
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{user.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.points} баллов</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 