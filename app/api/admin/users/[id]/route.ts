import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Prevent self-deletion
    if (params.id === session.user.id) {
      return new NextResponse(
        "Cannot delete your own account", 
        { status: 400 }
      )
    }

    // Get user details before deletion
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    })

    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    // Delete user
    await prisma.user.delete({
      where: { id: params.id }
    })

    // Create activity log
    await prisma.activity.create({
      data: {
        userId: session.user.id,
        type: 'USER_DELETED',
        description: `Пользователь ${user.name || user.email} удален`,
        metadata: {
          userId: user.id,
          email: user.email,
          role: user.role
        }
      }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[USER_DELETE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 