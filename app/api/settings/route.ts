import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { pusherServer } from "@/lib/pusher"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    // Получаем актуальный объект пользователя с нужными полями
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        email: true,
        image: true,
        bio: true,
        // если у вас хранятся appearance, notifications, security - вы можете их вернуть тоже
      }
    })
    return NextResponse.json(user || {})
  } catch (error) {
    console.error("Settings GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: data.profile.name,
        email: data.profile.email,
        image: data.profile.image,
        bio: data.profile.bio,
        phone: data.profile.phone,
        company: data.profile.company,
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

    await pusherServer.trigger(`user-${session.user.id}`, 'settings-updated', {
      user: updatedUser
    })

    return NextResponse.json({ 
      message: "Настройки успешно сохранены",
      success: true,
      data: updatedUser
    })
  } catch (error) {
    return NextResponse.json({ 
      message: "Произошла ошибка при сохранении настроек",
      success: false 
    }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    const settings = await prisma.userSettings.upsert({
      where: { userId: session.user.id },
      update: data,
      create: {
        ...data,
        userId: session.user.id
      }
    })

    return NextResponse.json(settings)
  } catch (error) {
    return NextResponse.json({ message: "Internal Error" }, { status: 500 })
  }
} 