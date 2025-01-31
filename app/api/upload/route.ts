import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
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

    // Создаем директорию, если её нет
    const uploadDir = join(process.cwd(), "public/uploads")
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (error) {
      // Игнорируем ошибку, если директория уже существует
    }

    // Генерируем уникальное имя файла
    const fileName = `${session.user.id}-${Date.now()}.${file.type.split("/")[1]}`
    const path = join(uploadDir, fileName)

    // Сохраняем файл
    await writeFile(path, buffer)
    const url = `/uploads/${fileName}`

    // Сразу обновляем фото профиля
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: url }
    })

    return NextResponse.json({ url })
  } catch (error) {
    console.error("Upload error:", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 