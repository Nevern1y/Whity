import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { UAParser } from "ua-parser-js"
import { SessionService } from "@/lib/session-service"

interface DbSession {
  id: string
  sessionToken: string
  userId: string
  expires: Date
  userAgent: string | null
  location?: string | null
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Очищаем старые сессии
    await SessionService.cleanupOldSessions(session.user.id)

    // Проверяем подозрительную активность
    const hasSuspiciousActivity = await SessionService.checkSuspiciousActivity(session.user.id)
    
    const sessions = await prisma.session.findMany({
      where: {
        userId: session.user.id,
        expires: {
          gt: new Date()
        }
      },
      orderBy: {
        expires: 'desc'
      }
    }) as DbSession[]

    const currentSessionToken = req.headers.get('x-session-token')

    const formattedSessions = sessions.map((dbSession) => {
      const parser = new UAParser(dbSession.userAgent || '')
      const browser = parser.getBrowser()
      const os = parser.getOS()
      const device = parser.getDevice()

      // Обновляем время последней активности для текущей сессии
      if (dbSession.sessionToken === currentSessionToken) {
        SessionService.updateLastActive(dbSession.id)
      }

      return {
        id: dbSession.id,
        lastActive: dbSession.expires,
        current: dbSession.sessionToken === currentSessionToken,
        device: {
          name: `${browser.name || 'Браузер'} на ${os.name || 'Unknown OS'}`,
          type: device.type || 'desktop',
          browser: browser.name || 'Unknown Browser',
          os: os.name || 'Unknown OS',
          location: dbSession.location || 'Неизвестно'
        }
      }
    })

    return NextResponse.json({
      sessions: formattedSessions,
      hasSuspiciousActivity
    })
  } catch (error) {
    console.error("[SESSIONS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { sessionId } = await req.json()
    
    await prisma.session.delete({
      where: {
        id: sessionId,
        userId: session.user.id,
      }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[SESSION_DELETE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 