"use server"

import { prisma } from "@/lib/prisma"

export async function getCourseProgress(userId: string) {
  return await prisma.course.findMany({
    where: {
      courseProgress: {
        some: {
          userId
        }
      }
    },
    include: {
      courseProgress: {
        where: { userId }
      }
    }
  })
}

export async function getAchievements(userId: string) {
  return await prisma.userAchievement.findMany({
    where: { userId },
    include: {
      achievement: true
    }
  })
}

export async function getActivity(userId: string) {
  return await prisma.activity.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 10
  })
} 