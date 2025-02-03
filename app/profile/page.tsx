import { Metadata } from "next"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ProfileContent } from "@/components/profile/profile-content"
import { ProfileHeader } from "@/components/profile/profile-header"
import { Separator } from "@/components/ui/separator"
import { prisma } from "@/lib/prisma"

export const metadata: Metadata = {
  title: "Профиль | Аллель Агро",
  description: "Управление профилем пользователя",
}

interface CourseProgress {
  completedAt: Date | null;
  progress: number;
}

interface CourseRating {
  rating: number;
}

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  // Получаем расширенные данные пользователя
  const userData = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      courseProgress: true,
      userAchievements: true,
      sentFriendships: true,
      receivedFriendships: true,
      courseRatings: true,
      statistics: true,
      studySessions: true
    }
  })

  if (!userData) redirect("/login")

  // Подготавливаем статистику
  const stats = {
    completedCourses: userData.courseProgress.filter((p: CourseProgress) => p.completedAt).length,
    totalFriends: userData.sentFriendships.length + userData.receivedFriendships.length,
    averageRating: userData.courseRatings.length > 0
      ? (userData.courseRatings.reduce((acc: number, curr: CourseRating) => acc + curr.rating, 0) / userData.courseRatings.length).toFixed(1)
      : "0.0",
    achievements: userData.userAchievements.length,
    totalProgress: userData.courseProgress.length > 0
      ? userData.courseProgress.reduce((acc: number, curr: CourseProgress) => acc + curr.progress, 0) / userData.courseProgress.length
      : 0,
    currentStreak: userData.statistics?.currentStreak || 0,
    totalTimeSpent: userData.statistics?.totalTimeSpent || 0,
    certificatesEarned: userData.courseProgress.filter((p: CourseProgress) => p.completedAt).length
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background/90">
      {/* Декоративный фон */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-grid-white/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/95 to-transparent" />
      </div>

      <div className="container py-8 space-y-8 animate-fade-in">
        {/* Шапка профиля */}
        <ProfileHeader 
          user={userData}
          stats={stats}
        />

        <Separator className="my-8" />

        {/* Основной контент */}
        <ProfileContent 
          user={userData}
          stats={stats}
        />
      </div>
    </div>
  )
}

