import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Only allow users to delete their own avatar
    if (session.user.id !== params.id) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    await prisma.user.update({
      where: { id: params.id },
      data: { image: null }
    })

    return new NextResponse("Avatar deleted", { status: 200 })
  } catch (error) {
    console.error("Error deleting avatar:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 