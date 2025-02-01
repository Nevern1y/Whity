import { prisma } from "@/lib/prisma"
import { ActivityFeed } from "@/components/activity-feed"

interface ActivityFeedWrapperProps {
  userId: string
}

export default async function ActivityFeedWrapper({ userId }: ActivityFeedWrapperProps) {
  const activities = await prisma.activity.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 10
  })

  return <ActivityFeed activities={activities} />
} 