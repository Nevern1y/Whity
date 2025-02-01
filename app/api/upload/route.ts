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

    const form = await req.formData()
    const file = form.get("file") as File
    
    if (!file) {
      return new NextResponse("No file in request", { status: 400 })
    }

    // Создаем директорию, если её нет
    const uploadDir = join(process.cwd(), "public/uploads/avatars")
    try {
      await fs.promises.mkdir(uploadDir, { recursive: true })
    } catch (error) {
      console.error("Error creating directory:", error)
    }

    // Создаем уникальное имя файла
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const fileName = `avatar-${session.user.id}-${Date.now()}.jpg`
    const path = join(uploadDir, fileName)
    
    // Сохраняем файл
    await writeFile(path, buffer)
    const fileUrl = `/uploads/avatars/${fileName}`

    // Удаляем старый файл, если он существует
    if (session.user.image) {
      const oldPath = join(process.cwd(), "public", session.user.image)
      try {
        await fs.promises.unlink(oldPath)
      } catch (error) {
        console.error("Error deleting old file:", error)
      }
    }

    // Обновляем URL в базе данных
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { image: fileUrl }
    })

    return NextResponse.json({ 
      url: fileUrl,
      user: updatedUser 
    })
  } catch (error) {
    console.error("Error uploading file:", error)
    return new NextResponse("Error uploading file", { status: 500 })
  }
} 