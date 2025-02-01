import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const stats = await prisma.userStatistics.findUnique({
    where: { userId: session.user.id },
    include: {
      user: {
        select: {
          courseProgress: true,
          userAchievements: {
            include: {
              achievement: true
            }
          }
        }
      }
    }
  })

  return NextResponse.json(stats)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const { timeSpent } = await req.json()

  const stats = await prisma.userStatistics.upsert({
    where: { userId: session.user.id },
    update: {
      totalTimeSpent: { increment: timeSpent },
      lastActiveAt: new Date()
    },
    create: {
      userId: session.user.id,
      totalTimeSpent: timeSpent
    }
  })

  return NextResponse.json(stats)
} 