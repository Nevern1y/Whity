import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { writeFile } from "fs/promises"
import { join } from "path"

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

    // Генерируем уникальное имя файла
    const fileName = `${session.user.id}-${Date.now()}.${file.type.split("/")[1]}`
    const path = join(process.cwd(), "public/uploads", fileName)

    // Сохраняем файл
    await writeFile(path, buffer)
    const imageUrl = `/uploads/${fileName}`

    // Обновляем профиль пользователя
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: imageUrl }
    })

    return NextResponse.json({ imageUrl })
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 })
  }
} 