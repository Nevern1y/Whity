import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.text()
    if (!body) {
      return new NextResponse("No body provided", { status: 400 })
    }

    const { status } = JSON.parse(body)
    if (!status) {
      return new NextResponse("Status is required", { status: 400 })
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { 
        status,
        lastActive: new Date()
      },
      select: {
        id: true,
        status: true,
        lastActive: true
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("[STATUS_UPDATE_ERROR]", error)
    if (error instanceof SyntaxError) {
      return new NextResponse("Invalid JSON", { status: 400 })
    }
    return new NextResponse("Internal Error", { status: 500 })
  }
} 