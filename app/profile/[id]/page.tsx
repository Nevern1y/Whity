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
import { FriendActionButton } from "@/components/friend-action-button"
import { FriendshipValidator } from "@/lib/friendship-validator"
import { ExtendedFriendshipStatus } from "@/lib/constants"
import { 
  FriendshipStatusBadge,
  ProfilePageContent as NewProfilePageContent 
} from "@/components"

interface ProfilePageProps {
  params: {
    id: string
  }
}

export type ProfileFriendshipStatus = ExtendedFriendshipStatus | 'SELF'

async function getFriendshipStatus(userId: string, targetUserId: string): Promise<ProfileFriendshipStatus> {
  const friendship = await prisma.friendship.findFirst({
    where: {
      OR: [
        { senderId: userId, receiverId: targetUserId },
        { senderId: targetUserId, receiverId: userId }
      ]
    }
  })

  return (friendship?.status as ProfileFriendshipStatus) || 'NONE'
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  // Проверяем, существует ли пользователь с таким ID
  const user = await prisma.user.findFirst({
    where: {
      id: params.id,
    },
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

  if (!user) {
    redirect('/friends')
  }

  const isOwnProfile = session.user.id === params.id
  const friendshipStatus = await FriendshipValidator.getFriendshipStatus(
    session.user.id,
    params.id
  )

  return (
    <ProfilePageContent 
      params={params}
      profileData={user}
      isOwnProfile={isOwnProfile}
      initialFriendshipStatus={friendshipStatus}
    >
      {!isOwnProfile && (
        <FriendActionButton 
          userId={params.id}
          initialStatus={friendshipStatus}
          isSender={user.sentFriendships.some((f: { senderId: string }) => f.senderId === session.user.id)}
        />
      )}
    </ProfilePageContent>
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

interface Friendship {
  senderId: string
  receiverId: string
  status: string
} 