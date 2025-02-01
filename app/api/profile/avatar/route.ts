import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import path from "path"

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ 
        success: false, 
        message: "Unauthorized" 
      }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    
    if (!file) {
      return NextResponse.json({ 
        success: false, 
        message: "No file uploaded" 
      }, { status: 400 })
    }

    // Проверяем тип файла
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ 
        success: false, 
        message: "File must be an image" 
      }, { status: 400 })
    }

    // Создаем директорию, если её нет
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (error) {
      // Игнорируем ошибку, если директория уже существует
    }

    // Генерируем уникальное имя файла
    const ext = path.extname(file.name)
    const fileName = `${session.user.id}-${Date.now()}${ext}`
    const filePath = path.join(uploadDir, fileName)
    
    // Читаем и сохраняем файл
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Формируем абсолютный URL для файла
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const fileUrl = `/uploads/${fileName}`

    // Обновляем профиль пользователя
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { image: fileUrl }
    })

    // Создаем запись об активности
    await prisma.activity.create({
      data: {
        userId: session.user.id,
        type: "PROFILE_UPDATE",
        description: "Обновил фото профиля",
        metadata: { imageUrl: fileUrl }
      }
    })

    return NextResponse.json({ 
      success: true,
      url: fileUrl,
      user: updatedUser
    })

  } catch (error) {
    console.error("[AVATAR_UPLOAD_ERROR]", error)
    return NextResponse.json({ 
      success: false, 
      message: "Error uploading avatar" 
    }, { status: 500 })
  }
} 