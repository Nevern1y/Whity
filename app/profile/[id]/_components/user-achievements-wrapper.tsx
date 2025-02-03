"use client"

import { UserAchievements } from "@/components/user-achievements"

interface UserAchievementsWrapperProps {
  userId: string
  data: any // Используйте правильный тип из вашей схемы
}

export default function UserAchievementsWrapper({ data }: UserAchievementsWrapperProps) {
  return <UserAchievements achievements={data} />
} 