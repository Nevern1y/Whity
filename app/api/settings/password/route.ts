import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { currentPassword, newPassword } = await req.json()

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { 
        hashedPassword: true
      }
    })

    if (!user || !user.hashedPassword) {
      return new NextResponse("User not found", { status: 404 })
    }

    const isValid = await bcrypt.compare(currentPassword, user.hashedPassword)
    if (!isValid) {
      return new NextResponse("Invalid current password", { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({
      where: { id: session.user.id },
      data: { 
        hashedPassword: hashedPassword
      }
    })

    return new NextResponse("Password updated successfully")
  } catch (error) {
    console.error("[PASSWORD_UPDATE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 