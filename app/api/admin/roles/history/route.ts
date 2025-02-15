import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id || !["ADMIN", "MANAGER"].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Получаем историю изменений ролей из активности
    const roleChanges = await prisma.activity.findMany({
      where: {
        type: "ROLE_CHANGE"
      },
      select: {
        id: true,
        createdAt: true,
        description: true,
        metadata: true,
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
      },
      take: 50 // Ограничиваем 50 последними записями
    })

    // Преобразуем данные в нужный формат
    const formattedHistory = roleChanges.map(change => ({
      id: change.id,
      userId: (change.metadata as any).targetUserId,
      oldRole: (change.metadata as any).oldRole,
      newRole: (change.metadata as any).newRole,
      reason: (change.metadata as any).reason,
      changedBy: change.user,
      createdAt: change.createdAt,
      description: change.description
    }))

    return NextResponse.json(formattedHistory)
  } catch (error) {
    console.error("[ROLE_HISTORY_ERROR]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 