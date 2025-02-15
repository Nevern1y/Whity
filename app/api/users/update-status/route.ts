import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/auth"
import { getServerSession } from "next-auth"

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    await prisma.user.upsert({
      where: { id: session.user.id },
      update: { 
        isOnline: true,
        lastActive: new Date()
      },
      create: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        isOnline: true,
        lastActive: new Date()
      }
    })

    return new NextResponse("Status updated", { status: 200 })
  } catch (error) {
    console.error("Error updating status:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 