"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Activity {
  user: {
    name: string | null
    email: string | null
    image: string | null
  }
  createdAt: Date
  type: string
  description: string
}

interface RecentSalesProps {
  activity: Activity[]
}

export function RecentSales({ activity }: RecentSalesProps) {
  return (
    <div className="space-y-8">
      {activity.map((item, index) => (
        <div key={index} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src={item.user.image || undefined} alt="Avatar" />
            <AvatarFallback>
              {item.user.name?.charAt(0) || item.user.email?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">
              {item.user.name || item.user.email}
            </p>
            <p className="text-sm text-muted-foreground">
              {item.description}
            </p>
          </div>
          <div className="ml-auto text-sm text-muted-foreground">
            {new Date(item.createdAt).toLocaleDateString()}
          </div>
        </div>
      ))}
    </div>
  )
} 