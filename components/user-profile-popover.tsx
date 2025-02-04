"use client"

import { Card } from "@/components/ui/card"
import { UserAvatar } from "@/components/user-avatar"
import { Button } from "@/components/ui/button"
import { AddFriendButton } from "@/components/add-friend-button"
import { MessageSquare, User, BookOpen, Trophy } from "lucide-react"
import Link from "next/link"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useRouter } from "next/navigation"

interface UserProfilePopoverProps {
  user: {
    id: string
    name: string | null
    image: string | null
    role?: string
    coursesCompleted?: number
    achievementsCount?: number
  }
  friendshipStatus?: 'NONE' | 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'SELF'
  trigger?: React.ReactNode
}

export function UserProfilePopover({ 
  user, 
  friendshipStatus = 'NONE',
  trigger 
}: UserProfilePopoverProps) {
  const router = useRouter()

  const stats = [
    {
      icon: BookOpen,
      label: "Курсов пройдено",
      value: user.coursesCompleted || 0
    },
    {
      icon: Trophy,
      label: "Достижений",
      value: user.achievementsCount || 0
    }
  ]

  return (
    <Popover>
      <PopoverTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm">
            Посмотреть профиль
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <Card className="border-0">
          <div className="p-4">
            <div className="flex items-start gap-4">
              <UserAvatar
                src={user.image}
                name={user.name}
                className="h-16 w-16"
              />
              <div className="flex-1 space-y-1">
                <h4 className="font-semibold">{user.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {user.role || "Пользователь"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              {stats.map(({ icon: Icon, label, value }) => (
                <div 
                  key={label} 
                  className="flex flex-col items-center p-2 rounded-lg bg-muted/50"
                >
                  <Icon className="h-4 w-4 text-muted-foreground mb-1" />
                  <span className="text-xs text-muted-foreground">{label}</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2 mt-4">
              {friendshipStatus === 'ACCEPTED' ? (
                <Button 
                  variant="secondary" 
                  className="flex-1"
                  onClick={() => router.push(`/messages?userId=${user.id}`)}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Написать
                </Button>
              ) : friendshipStatus !== 'SELF' && (
                <AddFriendButton 
                  targetUserId={user.id} 
                  initialStatus={friendshipStatus}
                />
              )}
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => router.push(`/profile/${user.id}`)}
              >
                <User className="h-4 w-4 mr-2" />
                Открыть профиль
              </Button>
            </div>
          </div>
        </Card>
      </PopoverContent>
    </Popover>
  )
} 