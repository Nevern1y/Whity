import { prisma } from "@/lib/prisma"
import { UserAchievements } from "@/components/user-achievements"

interface UserAchievementsWrapperProps {
  userId: string
}

export default async function UserAchievementsWrapper({ userId }: UserAchievementsWrapperProps) {
  const achievements = await prisma.userAchievement.findMany({
    where: { userId },
    include: {
      achievement: true
    }
  })

  return <UserAchievements achievements={achievements} />
} 