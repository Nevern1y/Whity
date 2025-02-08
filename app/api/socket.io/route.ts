import { NextRequest, NextResponse } from "next/server"
import { initSocketServer } from "@/lib/socket-server"

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  try {
    const io = initSocketServer(req as any, { socket: { server: {} } } as any)
    return new NextResponse(null, { status: 200 })
  } catch (error) {
    console.error("Socket.IO initialization error:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  return GET(req)
}
