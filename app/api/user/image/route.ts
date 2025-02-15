import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await request.json()
    const { image } = body

    // Update user record with new image
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image }
    })

    return new NextResponse(null, { status: 200 })
  } catch (error) {
    console.error("[USER_IMAGE_UPDATE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Update user record to remove image
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: null }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[USER_IMAGE_DELETE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 