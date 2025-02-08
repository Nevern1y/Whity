"use client"

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
import { ProfilePageContent } from "@/components/profile/profile-page-content"
import { FriendActionButton } from "@/components/friend-action-button"
import { FriendshipValidator } from "@/lib/friendship-validator"
import { ExtendedFriendshipStatus } from "@/lib/constants"
import { 
  FriendshipStatusBadge,
  ProfilePageContent as NewProfilePageContent 
} from "@/components"
import { useSession } from "next-auth/react"
import { DashboardButton } from "@/components/profile/dashboard-button"
import { useRouter } from "next/navigation"

interface ProfilePageProps {
  params: {
    id: string
  }
}

interface ProfileData {
  id: string
  name: string | null
  email: string | null
  image: string | null
  createdAt: Date
  friendshipStatus: string
  isOwnProfile: boolean
  courseProgress: Array<{
    completedAt: Date | null
    progress: number
  }>
  userAchievements: Array<{
    id: string
    achievement: any
  }>
  courseRatings: Array<{
    rating: number
  }>
  sentFriendships: Array<{
    id: string
    status: string
    receiver: {
      id: string
      name: string | null
      email: string | null
      image: string | null
    }
  }>
  receivedFriendships: Array<{
    id: string
    status: string
    sender: {
      id: string
      name: string | null
      email: string | null
      image: string | null
    }
  }>
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [imageError, setImageError] = useState(false)
  const [isImageLoaded, setIsImageLoaded] = useState(false)

  useEffect(() => {
    async function loadProfileData() {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/users/${params.id}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            setError("Пользователь не найден")
            return
          }
          throw new Error("Failed to load profile")
        }
        
        const data = await response.json()
        setProfileData(data)
      } catch (error) {
        console.error("Error loading profile:", error)
        setError("Ошибка загрузки профиля")
      } finally {
        setIsLoading(false)
      }
    }

    loadProfileData()
  }, [params.id])

  if (isLoading) {
    return (
      <div className="container py-8">
        <Card className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-muted rounded-lg" />
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded-lg" />
              ))}
            </div>
          </div>
        </Card>
      </div>
    )
  }

  if (error || !profileData) {
    return (
      <div className="container py-8">
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">{error || "Профиль не найден"}</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8 space-y-8">
      {/* Profile Header */}
      <div className="relative">
        {/* Background Card with Gradient */}
        <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-orange-500/10 via-orange-500/5 to-transparent">
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px]" />
        </div>

        {/* Main Profile Card */}
        <Card className="relative mt-24">
          {/* Avatar Overlay */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-16">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-b from-white/50 to-white/10 dark:from-white/10 dark:to-white/5 rounded-full blur-sm" />
              <Avatar className="relative w-32 h-32 border-4 border-background shadow-xl rounded-full overflow-hidden">
                {profileData.image && !imageError ? (
                  <AvatarImage
                    src={profileData.image}
                    className="object-cover"
                    onLoad={() => setIsImageLoaded(true)}
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <AvatarFallback className="text-2xl font-semibold bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-900 dark:to-orange-800">
                    {profileData.name?.[0] || '?'}
                  </AvatarFallback>
                )}
              </Avatar>
            </div>
          </div>

          {/* Content Container */}
          <div className="pt-20 pb-6 px-6">
            {/* User Info */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold bg-gradient-to-br from-orange-600 to-orange-500 dark:from-orange-400 dark:to-orange-300 bg-clip-text text-transparent">
                {profileData.name}
              </h1>
              <p className="text-muted-foreground mt-1">{profileData.email}</p>
              <p className="text-sm text-muted-foreground bg-orange-50 dark:bg-orange-500/5 px-3 py-1 rounded-full inline-block mt-2">
                На сайте с {formatDistanceToNow(new Date(profileData.createdAt), { 
                  addSuffix: true, 
                  locale: ru 
                })}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="max-w-sm mx-auto space-y-3">
              {profileData.isOwnProfile && (
                <DashboardButton 
                  userId={params.id} 
                  currentUserId={session?.user?.id} 
                />
              )}
              
              {!profileData.isOwnProfile && session?.user && (
                <FriendActionButton 
                  userId={params.id}
                  initialStatus={profileData.friendshipStatus}
                />
              )}
            </div>
          </div>
        </Card>
      </div>
      
      {/* Profile Content */}
      <ProfilePageContent 
        userId={params.id} 
        session={session}
        initialData={profileData}
      />
    </div>
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