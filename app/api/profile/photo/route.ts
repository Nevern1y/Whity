import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { imageUrl } = await req.json()

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { image: imageUrl }
    })

    // Создаем запись об активности
    await prisma.activity.create({
      data: {
        userId: session.user.id,
        type: 'PROFILE',
        description: 'Изменил фотографию профиля',
        metadata: {
          title: 'Обновил фото профиля'
        }
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 })
  }
} 