import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { read } = await req.json()
    
    const notification = await prisma.notification.update({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      data: { read },
    })

    return NextResponse.json(notification)
  } catch (error) {
    console.error("[NOTIFICATION_PATCH]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 