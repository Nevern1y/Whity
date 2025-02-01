import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const activities = await prisma.activity.findMany({
    where: {
      userId: session.user.id
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 10
  })

  return NextResponse.json(activities)
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { type, title, description, metadata } = await req.json()
    
    const activity = await prisma.activity.create({
      data: {
        userId: session.user.id,
        type,
        description,
        metadata: metadata ? metadata : null
      }
    })

    return NextResponse.json(activity, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create activity" }, { status: 500 })
  }
} 