import { auth } from "@/lib/auth"
import { writeFile } from "fs/promises"
import { join } from "path"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import fs from "fs"

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

    // Создаем уникальное имя файла
    const fileName = `${session.user.id}-${Date.now()}-${file.name}`
    const filePath = join("public", "uploads", fileName)
    const buffer = Buffer.from(await file.arrayBuffer())

    // Сохраняем файл
    await writeFile(filePath, buffer)

    // Сохраняем информацию о файле в базу данных
    const upload = await prisma.upload.create({
      data: {
        fileName,
        fileType: file.type,
        filePath: `/uploads/${fileName}`,
        fileSize: file.size,
        userId: session.user.id,
      },
    })

    // Обновляем поле image у пользователя
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: `/uploads/${fileName}` },
    })

    return NextResponse.json({ 
      url: `/uploads/${fileName}`,
      upload 
    })
  } catch (error) {
    console.error("Upload error:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 