import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

interface SecuritySettings {
  twoFactorEnabled: boolean
  sessionTimeout?: number
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { twoFactorEnabled, sessionTimeout } = body

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        twoFactorEnabled,
        sessionTimeout
      }
    })

    await prisma.securityLog.create({
      data: {
        userId: session.user.id,
        event: 'SECURITY_SETTINGS_UPDATE',
        ip: req.headers.get('x-forwarded-for') || 'unknown',
        location: req.headers.get('x-vercel-ip-country') || 'unknown'
      }
    })

    return NextResponse.json({
      message: "Security settings updated successfully",
      settings: { twoFactorEnabled, sessionTimeout }
    })

  } catch (error) {
    console.error("[SECURITY_SETTINGS_UPDATE]", error)
    return NextResponse.json({ error: "Failed to update security settings" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { 
        twoFactorEnabled: true,
        sessionTimeout: true
      }
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("[SECURITY_SETTINGS_GET]", error)
    return NextResponse.json({ error: "Failed to fetch security settings" }, { status: 500 })
  }
} 