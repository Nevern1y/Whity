import { auth } from "@/auth"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { NextResponse } from "next/server"
import fs from "fs/promises"

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

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Создаем директорию, если её нет
    const uploadDir = path.join(process.cwd(), "public", "uploads")
    await mkdir(uploadDir, { recursive: true })

    const fileName = `${Date.now()}-${file.name}`
    const filePath = path.join(uploadDir, fileName)

    await writeFile(filePath, buffer)
    
    // Возвращаем только имя файла, без /uploads/
    return NextResponse.json({ fileName })
  } catch (error) {
    console.error("UPLOAD_ERROR:", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 