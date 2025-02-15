import { Metadata } from "next"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { ProfileContent } from "@/components/profile/profile-content"
import { ProfileHeader } from "@/components/profile/profile-header"
import { Separator } from "@/components/ui/separator"
import { prisma } from "@/lib/prisma"
import type { User, UserRole } from "@prisma/client"

export const metadata: Metadata = {
  title: "Профиль | Аллель Агро",
  description: "Управление профилем пользователя",
}

interface CourseProgress {
  completedAt: Date | null
  progress: number
}

interface CourseRating {
  rating: number
}

interface Activity {
  type: string
  metadata: any
  createdAt: Date
}

interface UserData extends User {
  courseProgress: CourseProgress[]
  achievements: { id: string }[]
  sentFriendships: { id: string; status: string }[]
  receivedFriendships: { id: string; status: string }[]
  courseRatings: CourseRating[]
  activities: Activity[]
}

interface ProfileUser {
  id: string
  name: string | null
  email: string | null
  image: string | null
  role: string
  createdAt: Date | undefined
}

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  // Получаем расширенные данные пользователя
  const userData = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      courseProgress: true,
      achievements: true,
      sentFriendships: {
        where: {
          status: "ACCEPTED"
        }
      },
      receivedFriendships: {
        where: {
          status: "ACCEPTED"
        }
      },
      courseRatings: true,
      activities: {
        orderBy: {
          createdAt: 'desc'
        },
        take: 10,
        where: {
          type: "STUDY"
        }
      }
    }
  })

  if (!userData) redirect("/login")

  // Вычисляем общее время обучения из активностей
  const totalTimeSpent = userData.activities.reduce((acc, activity: Activity) => {
    if (activity.type === "STUDY" && activity.metadata?.duration) {
      return acc + activity.metadata.duration
    }
    return acc
  }, 0)

  // Вычисляем текущую серию из активностей
  const currentStreak = calculateStreak(userData.activities)

  // Подготавливаем статистику
  const stats = {
    completedCourses: userData.courseProgress.filter((p: CourseProgress) => p.completedAt).length,
    totalFriends: userData.sentFriendships.length + userData.receivedFriendships.length,
    averageRating: userData.courseRatings.length > 0
      ? (userData.courseRatings.reduce((acc: number, curr: CourseRating) => acc + curr.rating, 0) / userData.courseRatings.length).toFixed(1)
      : "0.0",
    achievements: userData.achievements.length,
    totalProgress: userData.courseProgress.length > 0
      ? userData.courseProgress.reduce((acc: number, curr: CourseProgress) => acc + curr.progress, 0) / userData.courseProgress.length
      : 0,
    currentStreak,
    totalTimeSpent,
    certificatesEarned: userData.courseProgress.filter((p: CourseProgress) => p.completedAt).length
  }

  // Подготавливаем данные пользователя для компонентов
  const userInfo: ProfileUser = {
    id: userData.id,
    name: userData.name,
    email: userData.email,
    image: userData.image,
    role: userData.role,
    createdAt: userData.createdAt
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
          user={userInfo}
          stats={stats}
        />

        <Separator className="my-8" />

        {/* Основной контент */}
        <ProfileContent 
          user={userInfo}
          stats={stats}
        />
      </div>
    </div>
  )
}

// Функция для вычисления текущей серии активности
function calculateStreak(activities: Activity[]): number {
  if (!activities.length) return 0

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  // Сортируем активности по дате (от новых к старым)
  const sortedActivities = [...activities].sort((a, b) => 
    b.createdAt.getTime() - a.createdAt.getTime()
  )

  // Проверяем, была ли активность сегодня или вчера
  const lastActivity = sortedActivities[0]
  const lastActivityDate = new Date(lastActivity.createdAt)
  lastActivityDate.setHours(0, 0, 0, 0)

  if (lastActivityDate.getTime() !== today.getTime() && 
      lastActivityDate.getTime() !== yesterday.getTime()) {
    return 0
  }

  // Считаем непрерывные дни активности
  let streak = 1
  let currentDate = lastActivityDate

  for (let i = 1; i < sortedActivities.length; i++) {
    const activityDate = new Date(sortedActivities[i].createdAt)
    activityDate.setHours(0, 0, 0, 0)

    const expectedDate = new Date(currentDate)
    expectedDate.setDate(expectedDate.getDate() - 1)

    if (activityDate.getTime() === expectedDate.getTime()) {
      streak++
      currentDate = activityDate
    } else {
      break
    }
  }

  return streak
}

