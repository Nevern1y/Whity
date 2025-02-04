import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const friendshipId = params.id
    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId },
      select: {
        id: true,
        status: true,
        receiverId: true,
        senderId: true
      }
    })

    if (!friendship) {
      return new NextResponse("Friendship not found", { status: 404 })
    }

    // Проверяем, что текущий пользователь является получателем запроса
    if (friendship.receiverId !== session.user.id) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    // Обновляем статус дружбы
    const updatedFriendship = await prisma.friendship.update({
      where: { id: friendshipId },
      data: { status: "REJECTED" }
    })

    return NextResponse.json(updatedFriendship)
  } catch (error) {
    console.error("[FRIENDSHIP_REJECT]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 