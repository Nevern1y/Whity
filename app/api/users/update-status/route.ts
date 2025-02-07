import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authConfig } from "@/lib/auth"
import { getServerSession } from "next-auth/next"

export async function POST(req: Request) {
  try {
    console.group('[UpdateStatus]')
    console.log('Headers:', Object.fromEntries(req.headers))
    
    const session = await getServerSession(authConfig)
    console.log('Session Data:', {
      exists: !!session,
      userId: session?.user?.id,
      hasToken: !!session?.accessToken
    })
    
    if (!session?.user?.id) {
      console.warn('No valid session found')
      console.groupEnd()
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!existingUser) {
      console.warn('User not found in database')
      console.groupEnd()
      return new NextResponse("User not found", { status: 404 })
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { 
        isOnline: true,
        lastActive: new Date()
      }
    })

    console.log('User Updated:', {
      id: updatedUser.id,
      isOnline: updatedUser.isOnline,
      lastActive: updatedUser.lastActive
    })
    console.groupEnd()

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("[UpdateStatus] Error:", error)
    console.groupEnd()
    return new NextResponse("Internal Error", { status: 500 })
  }
} 