"use client"

import { ActivityFeed } from "@/components/activity-feed"

interface ActivityFeedWrapperProps {
  userId: string
  data: any // Используйте правильный тип из вашей схемы
}

export default function ActivityFeedWrapper({ data }: ActivityFeedWrapperProps) {
  return <ActivityFeed activities={data} />
} 