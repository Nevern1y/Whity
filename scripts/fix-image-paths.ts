import { prisma } from "@/lib/prisma"

async function fixImagePaths() {
  try {
    // 1. Получаем все курсы
    const courses = await prisma.course.findMany({
      select: {
        id: true,
        image: true
      }
    })

    // 2. Исправляем пути к изображениям
    for (const course of courses) {
      if (course.image) {
        let newImagePath = course.image

        // Убираем префикс /uploads/ если он есть
        if (newImagePath.startsWith('/uploads/')) {
          newImagePath = newImagePath.replace('/uploads/', '')
        }

        // Убираем префикс /course-images/ если он есть
        if (newImagePath.startsWith('/course-images/')) {
          newImagePath = newImagePath.replace('/course-images/', '')
        }

        // Обновляем запись в базе данных
        await prisma.course.update({
          where: { id: course.id },
          data: { image: newImagePath }
        })
      }
    }

    console.log('Successfully fixed image paths')
  } catch (error) {
    console.error('Error fixing image paths:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Запускаем скрипт
fixImagePaths() 