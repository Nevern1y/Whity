import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    // Allow public access to basic profile info
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
        courseProgress: {
          select: {
            completedAt: true,
            progress: true
          }
        },
        userAchievements: {
          select: {
            id: true,
            achievement: true
          }
        },
        courseRatings: {
          select: {
            rating: true
          }
        },
        sentFriendships: {
          select: {
            id: true,
            status: true,
            receiver: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
              }
            }
          }
        },
        receivedFriendships: {
          select: {
            id: true,
            status: true,
            sender: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
              }
            }
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Calculate friendship status if logged in
    let friendshipStatus = 'NONE'
    let isReceivedRequest = false
    if (session?.user?.id) {
      const friendship = await prisma.friendship.findFirst({
        where: {
          OR: [
            { senderId: session.user.id, receiverId: params.id },
            { senderId: params.id, receiverId: session.user.id }
          ]
        }
      })
      if (friendship) {
        friendshipStatus = friendship.status
        // Check if current user is the receiver of the request
        isReceivedRequest = friendship.status === 'PENDING' && friendship.receiverId === session.user.id
      }
    }

    return NextResponse.json({
      ...user,
      friendshipStatus,
      isReceivedRequest,
      isOwnProfile: session?.user?.id === params.id
    })
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 