import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"

type UserRole = "ADMIN" | "MANAGER" | "USER"

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    // Проверяем, что текущий пользователь является админом
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return new NextResponse("Только администраторы могут изменять роли", { status: 401 })
    }

    const body = await req.json()
    const { role, reason } = body

    // Проверяем, что роль валидная
    if (!role || !["ADMIN", "MANAGER", "USER"].includes(role)) {
      return new NextResponse("Некорректная роль", { status: 400 })
    }

    // Проверяем, что указана причина изменения
    if (!reason?.trim()) {
      return new NextResponse("Необходимо указать причину изменения роли", { status: 400 })
    }

    // Запрещаем админу менять свою роль
    if (params.id === session.user.id) {
      return new NextResponse(
        "Невозможно изменить собственную роль", 
        { status: 400 }
      )
    }

    // Получаем текущую роль пользователя
    const currentUser = await prisma.user.findUnique({
      where: { id: params.id },
      select: { 
        id: true,
        role: true, 
        name: true, 
        email: true 
      }
    })

    if (!currentUser) {
      return new NextResponse("Пользователь не найден", { status: 404 })
    }

    // Начинаем транзакцию для обновления роли и создания записей
    const [updatedUser, activity, notification] = await prisma.$transaction([
      // 1. Обновляем роль пользователя
      prisma.user.update({
        where: { id: params.id },
        data: { role: role as UserRole }
      }),

      // 2. Создаем запись в логе активности
      prisma.activity.create({
        data: {
          userId: session.user.id,
          type: "ROLE_CHANGE",
          description: `Изменена роль пользователя ${currentUser.name || currentUser.email} с ${currentUser.role} на ${role}`,
          metadata: {
            targetUserId: params.id,
            oldRole: currentUser.role,
            newRole: role,
            reason: reason
          }
        }
      }),

      // 3. Создаем уведомление для пользователя
      prisma.notification.create({
        data: {
          userId: params.id,
          type: "ROLE_CHANGE",
          title: "Изменение роли",
          message: `Ваша роль была изменена с ${currentUser.role} на ${role}`,
          metadata: {
            oldRole: currentUser.role,
            newRole: role,
            reason: reason,
            changedBy: {
              id: session.user.id,
              name: session.user.name,
              email: session.user.email
            }
          }
        }
      })
    ])

    // 4. Принудительно обновляем все сессии пользователя
    await prisma.session.updateMany({
      where: { userId: params.id },
      data: { expires: new Date() }
    })

    return NextResponse.json({
      message: "Роль успешно обновлена. Пользователю необходимо перезайти в систему.",
      user: updatedUser,
      activity,
      notification
    })
  } catch (error) {
    console.error("[ROLE_UPDATE_ERROR]", error)
    return new NextResponse("Внутренняя ошибка сервера", { status: 500 })
  }
} 