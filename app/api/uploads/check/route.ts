import { NextResponse } from "next/server"
import { existsSync } from "fs"
import { join } from "path"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const filename = searchParams.get('file')

  if (!filename) {
    return NextResponse.json({ exists: false }, { status: 400 })
  }

  const filepath = join(process.cwd(), 'public', 'uploads', filename)
  const exists = existsSync(filepath)

  return NextResponse.json({ exists })
} 