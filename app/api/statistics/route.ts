import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
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
  const session = await getServerSession(authOptions)
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