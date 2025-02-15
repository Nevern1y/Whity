import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { format, subDays } from "date-fns"

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id || !["ADMIN", "MANAGER"].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Получаем все изменения ролей
    const roleChanges = await prisma.activity.findMany({
      where: {
        type: "ROLE_CHANGE"
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Получаем распределение ролей
    const users = await prisma.user.groupBy({
      by: ['role'],
      _count: true
    })

    const roleDistribution = users.reduce((acc, { role, _count }) => ({
      ...acc,
      [role]: _count
    }), {
      ADMIN: 0,
      MANAGER: 0,
      USER: 0
    })

    // Получаем статистику по последним 30 дням
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = subDays(new Date(), i)
      return {
        date: format(date, 'yyyy-MM-dd'),
        count: 0
      }
    }).reverse()

    roleChanges.forEach(change => {
      const date = format(change.createdAt, 'yyyy-MM-dd')
      const dayStats = last30Days.find(day => day.date === date)
      if (dayStats) {
        dayStats.count++
      }
    })

    // Получаем топ администраторов по количеству изменений
    const changerCounts = roleChanges.reduce((acc, change) => {
      const { id, name, email } = change.user
      acc[id] = acc[id] || { id, name: name || email, count: 0 }
      acc[id].count++
      return acc
    }, {} as Record<string, { id: string; name: string; count: number }>)

    const topChangers = Object.values(changerCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Вычисляем среднее время в роли
    const roleChangeDurations = roleChanges.reduce((acc, change) => {
      const userId = (change.metadata as any).targetUserId
      const timestamp = change.createdAt.getTime()
      
      if (!acc[userId]) {
        acc[userId] = [timestamp]
      } else {
        acc[userId].push(timestamp)
      }
      
      return acc
    }, {} as Record<string, number[]>)

    const durations = Object.values(roleChangeDurations)
      .map(timestamps => {
        if (timestamps.length < 2) return 0
        timestamps.sort((a, b) => a - b)
        return timestamps.reduce((sum, time, i, arr) => {
          if (i === 0) return 0
          return sum + (time - arr[i - 1])
        }, 0) / (timestamps.length - 1)
      })
      .filter(duration => duration > 0)

    const averageTimeInRole = durations.length > 0
      ? durations.reduce((sum, duration) => sum + duration, 0) / durations.length
      : 0

    return NextResponse.json({
      totalChanges: roleChanges.length,
      roleDistribution,
      recentChanges: last30Days,
      topChangers,
      averageTimeInRole
    })
  } catch (error) {
    console.error("[ROLE_STATS_ERROR]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 