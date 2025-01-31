import { prisma } from "@/lib/prisma"
import { ActivityFeed } from "@/components/activity-feed"

export default async function ActivityFeedWrapper({ userId }: { userId: string }) {
  const activities = await prisma.activity.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 10
  })

  return <ActivityFeed activities={activities} />
} 