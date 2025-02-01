import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function PATCH(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const data = await request.json()
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data,
      select: {
        name: true,
        email: true,
        image: true
      }
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("Update error:", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 