import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { writeFile } from "fs/promises"
import { join } from "path"
import { mkdir } from "fs/promises"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File
    if (!file) {
      return new NextResponse("No file uploaded", { status: 400 })
    }

    // Проверяем тип файла
    if (!file.type.startsWith("image/")) {
      return new NextResponse("File must be an image", { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Создаем директорию, если она не существует
    const uploadDir = join(process.cwd(), "public/uploads")
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (err) {
      // Игнорируем ошибку, если директория уже существует
    }

    // Генерируем уникальное имя файла
    const fileName = `${session.user.id}-${Date.now()}.${file.type.split("/")[1]}`
    const path = join(uploadDir, fileName)

    // Сохраняем файл
    await writeFile(path, buffer)
    const imageUrl = `/uploads/${fileName}`

    // Обновляем профиль пользователя
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { 
        image: imageUrl,
        updatedAt: new Date()
      }
    })

    // Создаем запись об активности
    await prisma.activity.create({
      data: {
        userId: session.user.id,
        type: "PROFILE_UPDATE",
        description: "Обновил фото профиля",
        metadata: { imageUrl }
      }
    })

    return NextResponse.json({ 
      success: true,
      imageUrl,
      user: updatedUser
    })
  } catch (error) {
    console.error("[UPLOAD_ERROR]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 