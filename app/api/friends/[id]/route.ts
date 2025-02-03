import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Удаляем дружбу в обоих направлениях
    await prisma.friendship.deleteMany({
      where: {
        OR: [
          { senderId: session.user.id, receiverId: params.id },
          { senderId: params.id, receiverId: session.user.id }
        ]
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[FRIENDSHIP_DELETE]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 