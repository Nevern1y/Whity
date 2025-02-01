import { prisma } from "@/lib/prisma"

interface CourseProgress {
  completedAt: Date | null;
}

export const ACHIEVEMENTS = {
  FIRST_COURSE: {
    id: "first-course",
    title: "Первый шаг",
    description: "Завершите свой первый курс",
    icon: "🎯",
    type: "COURSE_COMPLETE",
    requirement: 1
  },
  STUDY_STREAK: {
    id: "study-streak",
    title: "На волне",
    description: "Учитесь 7 дней подряд",
    icon: "🔥",
    type: "STREAK",
    requirement: 7
  },
  TIME_MASTER: {
    id: "time-master",
    title: "Мастер времени",
    description: "Проведите 100 часов за обучением",
    icon: "⏰",
    type: "TIME_SPENT",
    requirement: 6000 // минут
  },
  COURSE_MASTER: {
    id: "course-master",
    title: "Мастер курсов",
    description: "Завершите 10 курсов",
    icon: "📚",
    type: "COURSE_COMPLETE",
    requirement: 10
  },
  SPEED_LEARNER: {
    id: "speed-learner",
    title: "Быстрый ученик",
    description: "Завершите курс менее чем за 24 часа",
    icon: "⚡",
    type: "SPEED_COMPLETE",
    requirement: 1
  },
  PERFECT_SCORE: {
    id: "perfect-score",
    title: "Отличник",
    description: "Получите 100% по всем тестам в курсе",
    icon: "🎯",
    type: "PERFECT_SCORE",
    requirement: 1
  },
  LONG_STREAK: {
    id: "long-streak",
    title: "Марафонец",
    description: "Учитесь 30 дней подряд",
    icon: "🏃",
    type: "STREAK",
    requirement: 30
  },
  NIGHT_OWL: {
    id: "night-owl",
    title: "Ночная сова",
    description: "Учитесь после полуночи",
    icon: "🦉",
    type: "STUDY_TIME",
    requirement: 1
  }
} as const

export async function checkAchievements(userId: string) {
  const stats = await prisma.userStatistics.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          courseProgress: {
            select: {
              completedAt: true
            }
          },
          userAchievements: true
        }
      }
    }
  })

  if (!stats) return

  // Проверяем каждое достижение
  for (const [key, achievement] of Object.entries(ACHIEVEMENTS)) {
    const existingAchievement = await prisma.userAchievement.findUnique({
      where: {
        userId_achievementId: {
          userId,
          achievementId: achievement.id
        }
      }
    })

    if (existingAchievement?.completed) continue

    let progress = 0
    let completed = false

    switch (achievement.type) {
      case "COURSE_COMPLETE":
        progress = stats.user.courseProgress.filter((p: CourseProgress) => p.completedAt).length
        completed = progress >= achievement.requirement
        break
      case "STREAK":
        progress = stats.currentStreak
        completed = progress >= achievement.requirement
        break
      case "TIME_SPENT":
        progress = stats.totalTimeSpent
        completed = progress >= achievement.requirement
        break
    }

    if (existingAchievement) {
      await prisma.userAchievement.update({
        where: { id: existingAchievement.id },
        data: {
          progress,
          completed,
          earnedAt: completed ? new Date() : null
        }
      })
    } else {
      await prisma.userAchievement.create({
        data: {
          userId,
          achievementId: achievement.id,
          progress,
          completed,
          earnedAt: completed ? new Date() : null
        }
      })
    }

    if (completed) {
      // Отправляем уведомление о получении достижения
      await prisma.notification.create({
        data: {
          userId,
          title: "Новое достижение!",
          message: `Вы получили достижение "${achievement.title}"`,
          type: "ACHIEVEMENT",
          metadata: { achievementId: achievement.id }
        }
      })
    }
  }
} 