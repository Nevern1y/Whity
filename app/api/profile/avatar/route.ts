import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import path from "path"

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Проверяем существование пользователя перед обновлением
    const existingUser = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!existingUser) {
      return new NextResponse("User not found", { status: 404 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    
    if (!file) {
      return new NextResponse("No file uploaded", { status: 400 })
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
    await mkdir(uploadDir, { recursive: true })

    // Генерируем уникальное имя файла
    const ext = path.extname(file.name)
    const fileName = `${session.user.id}-${Date.now()}${ext}`
    const filePath = path.join(uploadDir, fileName)
    
    // Читаем и сохраняем файл
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    const fileUrl = `/uploads/${fileName}`

    // Создаем запись в БД о загруженном файле
    const upload = await prisma.upload.create({
      data: {
        fileName,
        fileType: file.type,
        filePath: fileUrl,
        fileSize: file.size,
        userId: session.user.id,
      },
    })

    // Обновляем аватар пользователя
    const updatedUser = await prisma.user.update({
      where: { 
        id: session.user.id,
      },
      data: { 
        image: fileUrl,
        updatedAt: new Date()
      }
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
    return new NextResponse("Internal Error", { status: 500 })
  }
} 