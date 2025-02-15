"use client"

import { withAnimation, type WithMotionProps } from "@/components/hoc/with-animation"
import { AvatarUpload } from "@/components/profile/avatar-upload"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { CalendarDays, Mail, MapPin } from "lucide-react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"

interface ProfileUser {
  id: string
  name: string | null
  email: string | null
  image: string | null
  role: string
  createdAt: Date | undefined
}

interface ProfileStats {
  completedCourses: number
  totalFriends: number
  averageRating: string
  achievements: number
}

interface ProfileHeaderProps {
  user: ProfileUser
  stats: ProfileStats
}

function ProfileHeaderBase({ m, isReady, user, stats }: ProfileHeaderProps & WithMotionProps) {
  if (!isReady || !m) {
    return (
      <Card className="overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary/10 via-primary/5 to-background" />
        <div className="relative px-6 pb-6">
          <div className="absolute -top-16 left-6">
            <AvatarUpload
              initialImage={user.image}
              onImageChange={() => {}}
            />
          </div>
          <div className="ml-36 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">{user.name}</h1>
              </div>
              <Badge variant="secondary" className="h-6">
                {user.role === "ADMIN" ? "Администратор" : "Пользователь"}
              </Badge>
            </div>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
                {user.email}
              </div>
              {user.createdAt && (
                <div className="flex items-center gap-1">
                  <CalendarDays className="h-4 w-4" />
                  На платформе с {format(new Date(user.createdAt), "dd MMMM yyyy", { locale: ru })}
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    )
  }

  const MotionDiv = m.div

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="overflow-hidden">
        <MotionDiv 
          className="h-32 bg-gradient-to-r from-primary/10 via-primary/5 to-background"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        />
        <div className="relative px-6 pb-6">
          <MotionDiv 
            className="absolute -top-16 left-6"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <AvatarUpload
              initialImage={user.image}
              onImageChange={() => {}}
            />
          </MotionDiv>
          <MotionDiv 
            className="ml-36 pt-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">{user.name}</h1>
              </div>
              <Badge variant="secondary" className="h-6">
                {user.role === "ADMIN" ? "Администратор" : "Пользователь"}
              </Badge>
            </div>
            <MotionDiv 
              className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
                {user.email}
              </div>
              {user.createdAt && (
                <div className="flex items-center gap-1">
                  <CalendarDays className="h-4 w-4" />
                  На платформе с {format(new Date(user.createdAt), "dd MMMM yyyy", { locale: ru })}
                </div>
              )}
            </MotionDiv>
          </MotionDiv>
        </div>
      </Card>
    </MotionDiv>
  )
}

export const ProfileHeader = withAnimation(ProfileHeaderBase) 