import { Metadata } from "next"
import { getServerSession } from "next-auth/next"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { AddFriendButton } from "@/components/add-friend-button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CourseProgressWrapper from "./_components/course-progress-wrapper"
import ActivityFeedWrapper from "./_components/activity-feed-wrapper"
import UserAchievementsWrapper from "./_components/user-achievements-wrapper"
import { BookOpen, Trophy, Star, Users2, Calendar } from "lucide-react"
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Suspense, useEffect, useState } from "react"
import { auth } from "@/lib/auth"
import type { User, Activity, Achievement } from "@/types/prisma"
import ProfileContent from './_components/profile-content'
import { Badge } from "@/components/ui/badge"
import { ProfilePageContent } from "./_components/profile-page-content"

interface ProfilePageProps {
  params: {
    id: string
  }
}

export type FriendshipStatus = 'NONE' | 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'SELF'

async function getProfileData(userId: string) {
  const userData = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      authoredCourses: true,
      enrolledCourses: true,
      courseProgress: true,
      sentFriendships: {
        include: {
          receiver: true
        }
      },
      receivedFriendships: {
        include: {
          sender: true
        }
      },
      courseRatings: true,
      userAchievements: {
        include: {
          achievement: true
        }
      }
    }
  })

  if (!userData) return null

  return userData
}

async function getFriendshipStatus(userId: string, targetUserId: string): Promise<FriendshipStatus> {
  const friendship = await prisma.friendship.findFirst({
    where: {
      OR: [
        { senderId: userId, receiverId: targetUserId },
        { senderId: targetUserId, receiverId: userId }
      ]
    }
  })

  return (friendship?.status as FriendshipStatus) || 'NONE'
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const profileData = await getProfileData(params.id)
  if (!profileData) notFound()

  const isOwnProfile = session.user.id === params.id
  const initialFriendshipStatus = isOwnProfile ? 'SELF' : 
    await getFriendshipStatus(session.user.id, params.id)

  return (
    <ProfilePageContent 
      params={params}
      profileData={profileData}
      isOwnProfile={isOwnProfile}
      initialFriendshipStatus={initialFriendshipStatus}
    />
  )
}

function StatCard({ icon: Icon, title, value }: { icon: any; title: string; value: number }) {
  return (
    <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-muted/50 text-center">
      <Icon className="w-6 h-6 text-primary mb-2" />
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  )
}

function FriendsList({ sentFriendships, receivedFriendships }: any) {
  const friends = [...sentFriendships, ...receivedFriendships]
    .filter(f => f.status === 'ACCEPTED')
    .map(f => f.sender || f.receiver)

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {friends.map(friend => (
        <Card key={friend.id}>
          <CardContent className="flex items-center gap-4 p-4">
            <Avatar>
              <AvatarImage src={friend.image || ''} />
              <AvatarFallback>{friend.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{friend.name}</p>
              <p className="text-sm text-muted-foreground">{friend.email}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 