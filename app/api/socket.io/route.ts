import { NextRequest } from "next/server"
import { getIO } from "@/lib/socket-server"
import { headers } from "next/headers"

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const headersList = headers()
  const isWebSocket = headersList.get("upgrade") === "websocket"

  if (isWebSocket) {
    return new Response(null, {
      status: 101,
      headers: {
        "Upgrade": "websocket",
        "Connection": "Upgrade"
      }
    })
  }

  return new Response(null, { status: 400 })
}

export async function POST(req: NextRequest) {
  return GET(req)
}
