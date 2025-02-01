import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createNotification } from "@/lib/notifications"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const achievements = await prisma.achievement.findMany({
      include: {
        userAchievements: {
          where: {
            userId: session.user.id
          }
        }
      }
    })

    return NextResponse.json(achievements)
  } catch (error) {
    console.error("[ACHIEVEMENTS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { achievementId } = await req.json()
    
    const achievement = await prisma.achievement.findUnique({
      where: { id: achievementId },
      select: {
        id: true,
        title: true,
      }
    })

    if (!achievement) {
      return new NextResponse("Achievement not found", { status: 404 })
    }

    const existingAchievement = await prisma.userAchievement.findUnique({
      where: {
        userId_achievementId: {
          userId: session.user.id,
          achievementId
        }
      }
    })

    if (existingAchievement) {
      return new NextResponse("Achievement already earned", { status: 400 })
    }

    const [userAchievement, stats] = await prisma.$transaction([
      prisma.userAchievement.create({
        data: {
          userId: session.user.id,
          achievementId,
          type: "COURSE",
          title: "Достижение",
          description: "Описание достижения"
        }
      }),
      prisma.userStats.upsert({
        where: { userId: session.user.id },
        update: {
          achievementsCount: {
            increment: 1
          }
        },
        create: {
          userId: session.user.id,
          achievementsCount: 1,
          coursesCompleted: 0,
          totalTimeSpent: 0
        }
      })
    ])

    await createNotification({
      userId: session.user.id,
      title: "Новое достижение",
      message: `Поздравляем! Вы получили достижение "${achievement.title}"`,
      type: "achievement",
      link: `/profile#achievements`,
      metadata: { achievementId: achievement.id }
    })

    return NextResponse.json({ success: true, achievement: userAchievement, stats })
  } catch (error) {
    console.error("[ACHIEVEMENT_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 