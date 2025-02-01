import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ role: null })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    })

    return NextResponse.json({ role: user?.role })
  } catch (error) {
    console.error("Error fetching user role:", error)
    return NextResponse.json(
      { error: "Failed to fetch user role" },
      { status: 500 }
    )
  }
} 