import { prisma } from "@/lib/prisma"
import { UserAchievements } from "@/components/user-achievements"

export default async function UserAchievementsWrapper({ userId }: { userId: string }) {
  const achievements = await prisma.userAchievement.findMany({
    where: { userId },
    include: {
      achievement: true
    }
  })

  return <UserAchievements achievements={achievements} />
} 