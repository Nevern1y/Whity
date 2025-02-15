import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { format } from "date-fns"
import { ru } from "date-fns/locale"

function escapeCSV(str: string) {
  if (typeof str !== 'string') return str
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function arrayToCSV(data: any[]) {
  const headers = Object.keys(data[0])
  const csvRows = []
  
  // Добавляем заголовки
  csvRows.push(headers.join(','))
  
  // Добавляем данные
  for (const row of data) {
    const values = headers.map(header => escapeCSV(row[header]))
    csvRows.push(values.join(','))
  }
  
  return csvRows.join('\n')
}

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

    // Форматируем данные для экспорта
    const exportData = roleChanges.map(change => ({
      "Дата": format(change.createdAt, 'dd.MM.yyyy HH:mm:ss'),
      "Администратор": change.user.name || change.user.email,
      "Старая роль": (change.metadata as any).oldRole,
      "Новая роль": (change.metadata as any).newRole,
      "Причина": (change.metadata as any).reason || "Не указана",
      "Пользователь": change.description.split(' с ')[0].replace('Изменена роль пользователя ', '')
    }))

    // Генерируем CSV
    const csv = arrayToCSV(exportData)

    // Добавляем BOM для корректного отображения кириллицы в Excel
    const csvWithBOM = '\uFEFF' + csv

    // Формируем имя файла
    const fileName = `role_changes_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`

    return new NextResponse(csvWithBOM, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    })
  } catch (error) {
    console.error("[ROLE_EXPORT_ERROR]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 