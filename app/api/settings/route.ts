import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { pusherServer } from "@/lib/pusher"
import type { Prisma, PrismaClient } from "@prisma/client"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        settings: true,
      }
    })

    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    // Форматируем данные в нужную структуру
    const formattedSettings = {
      profile: {
        name: user.name || "",
        email: user.email || "",
        phone: "",
        company: "",
        language: user.settings?.language || "ru",
        timezone: user.settings?.timezone || "Europe/Moscow"
      },
      appearance: {
        theme: user.settings?.theme || "system",
        animations: user.settings?.animations || true,
        fontSize: user.settings?.fontSize || "md",
        reducedMotion: false
      },
      notifications: user.settings?.notifications || {
        email: true,
        push: false,
        sounds: true,
        updates: true,
        newsletter: false
      },
      security: {
        twoFactor: user.twoFactorEnabled || false,
        sessionTimeout: user.sessionTimeout || 30,
        activeDevices: []
      }
    }

    return NextResponse.json(formattedSettings)
  } catch (error) {
    console.error("[SETTINGS_GET]", error)
    return NextResponse.json({ 
      message: "Произошла ошибка при загрузке настроек",
      success: false 
    }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const data = await req.json()
    
    // Добавляем типизацию для транзакции
    const result = await prisma.$transaction(async (tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'>) => {
      // Обновляем основные данные пользователя
      const updatedUser = await tx.user.update({
        where: { id: session.user.id },
        data: {
          name: data.profile.name,
          email: data.profile.email,
        }
      })

      // Обновляем настройки пользователя
      const settings = await tx.user.update({
        where: { id: session.user.id },
        data: {
          settings: {
            upsert: {
              create: {
                theme: data.appearance.theme,
                fontSize: data.appearance.fontSize,
                animations: data.appearance.animations,
                notifications: data.notifications,
                language: data.profile.language,
                timezone: data.profile.timezone,
              },
              update: {
                theme: data.appearance.theme,
                fontSize: data.appearance.fontSize,
                animations: data.appearance.animations,
                notifications: data.notifications,
                language: data.profile.language,
                timezone: data.profile.timezone,
              }
            }
          }
        },
        include: {
          settings: true
        }
      })

      return { user: updatedUser, settings }
    })

    // Отправляем обновление через Pusher
    await pusherServer.trigger(`user-${session.user.id}`, 'settings-updated', {
      user: result.user
    })

    return NextResponse.json({ 
      message: "Настройки успешно сохранены",
      success: true,
      data: result
    })
  } catch (error) {
    console.error("[SETTINGS_UPDATE]", error)
    return NextResponse.json({ 
      message: "Произошла ошибка при сохранении настроек",
      success: false 
    }, { status: 500 })
  }
} 