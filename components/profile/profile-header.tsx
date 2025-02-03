"use client"

import { motion } from "framer-motion"
import { AvatarUpload } from "@/components/profile/avatar-upload"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { CalendarDays, Mail, MapPin } from "lucide-react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"

interface ProfileHeaderProps {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    role: string;
    bio?: string | null;
    createdAt?: Date;
    location?: string;
  };
  stats: {
    completedCourses: number;
    totalFriends: number;
    averageRating: string;
    achievements: number;
  };
}

export function ProfileHeader({ user, stats }: ProfileHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="overflow-hidden">
        {/* Фоновое изображение */}
        <div className="h-32 bg-gradient-to-r from-primary/10 via-primary/5 to-background" />
        
        <div className="relative px-6 pb-6">
          {/* Аватар */}
          <div className="absolute -top-16 left-6">
            <AvatarUpload
              initialImage={user.image}
              onImageChange={() => {}}
            />
          </div>

          {/* Информация о пользователе */}
          <div className="ml-36 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <p className="text-muted-foreground">{user.bio || "Нет описания"}</p>
              </div>
              <Badge variant="secondary" className="h-6">
                {user.role === "ADMIN" ? "Администратор" : "Пользователь"}
              </Badge>
            </div>

            {/* Дополнительная информация */}
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
              {user.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {user.location}
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
} 