import { prisma } from "@/lib/prisma"

interface PrismaSession {
  id: string
  expires: Date
}

export const SessionService = {
  // Очистка старых сессий
  async cleanupOldSessions(userId: string) {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    await prisma.session.deleteMany({
      where: {
        userId: userId,
        expires: {
          lt: thirtyDaysAgo
        }
      }
    })
  },

  // Проверка подозрительной активности
  async checkSuspiciousActivity(userId: string) {
    const activeSessions = await prisma.session.findMany({
      where: {
        userId: userId,
        expires: {
          gt: new Date()
        }
      }
    }) as PrismaSession[]

    // Если больше 5 активных сессий - это подозрительно
    if (activeSessions.length > 5) {
      // Оставляем только последние 2 сессии
      const sessionsToKeep = activeSessions
        .sort((a, b) => b.expires.getTime() - a.expires.getTime())
        .slice(0, 2)

      // Удаляем остальные
      await prisma.session.deleteMany({
        where: {
          userId: userId,
          NOT: {
            id: {
              in: sessionsToKeep.map(s => s.id)
            }
          }
        }
      })

      return true
    }

    return false
  },

  // Обновление времени последней активности
  async updateLastActive(sessionId: string) {
    await prisma.session.update({
      where: { id: sessionId },
      data: {
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000) // +24 часа
      }
    })
  }
} 