"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { UserAvatar } from "@/components/user-avatar"
import { Button } from "@/components/ui/button"
import { AddFriendButton } from "@/components/add-friend-button"
import { MessageSquare, User, BookOpen, Trophy, Clock } from "lucide-react"
import Link from "next/link"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useRouter } from "next/navigation"
import { UserOnlineStatus } from "@/components/user-online-status"
import { Separator } from "@/components/ui/separator"
import { formatDistanceToNow } from "date-fns"
import { ru } from "date-fns/locale"
import { useSocket } from "@/hooks/use-socket"
import { SOCKET_EVENTS } from "@/components/providers/socket-provider"

interface UserProfilePopoverProps {
  user: {
    id: string
    name: string | null
    image: string | null
    role?: string
    coursesCompleted?: number
    achievementsCount?: number
    isOnline: boolean
    lastActive?: Date | null
  }
  friendshipStatus?: 'NONE' | 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'SELF'
  isReceivedRequest?: boolean
  trigger?: React.ReactNode
}

export function UserProfilePopover({ 
  user, 
  friendshipStatus = 'NONE',
  isReceivedRequest = false,
  trigger 
}: UserProfilePopoverProps) {
  const router = useRouter()
  const socket = useSocket()
  const [currentStatus, setCurrentStatus] = useState(friendshipStatus)

  useEffect(() => {
    setCurrentStatus(friendshipStatus)
  }, [friendshipStatus])

  useEffect(() => {
    if (!socket) return

    const handleFriendshipUpdate = (data: any) => {
      if (data.targetUserId === user.id || data.friendshipId) {
        setCurrentStatus(data.status)
      }
    }

    socket.on(SOCKET_EVENTS.FRIEND_REQUEST_RESPONSE, handleFriendshipUpdate)
    socket.on(SOCKET_EVENTS.FRIENDSHIP_UPDATE, handleFriendshipUpdate)

    return () => {
      socket.off(SOCKET_EVENTS.FRIEND_REQUEST_RESPONSE, handleFriendshipUpdate)
      socket.off(SOCKET_EVENTS.FRIENDSHIP_UPDATE, handleFriendshipUpdate)
    }
  }, [socket, user.id])

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
      <PopoverContent className="w-80 p-0" align="start" sideOffset={5}>
        <Card className="border-0">
          {/* Header Section */}
          <div className="p-4">
            <div className="flex items-start gap-4">
              <UserAvatar 
                user={{
                  image: user.image,
                  name: user.name
                }}
                className="h-12 w-12 border-2 border-background"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold truncate">{user.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-muted-foreground">
                    {user.role || "Пользователь"}
                  </span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <UserOnlineStatus 
                    isOnline={user.isOnline} 
                    showDot={false}
                    className="text-sm"
                  />
                </div>
                {!user.isOnline && user.lastActive && (
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(user.lastActive), { 
                      addSuffix: true,
                      locale: ru 
                    })}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Separator className="mb-4" />

          {/* Stats Section */}
          <div className="px-4 grid grid-cols-2 gap-3">
            {stats.map(({ icon: Icon, label, value }) => (
              <div 
                key={label} 
                className="flex flex-col items-center p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors"
              >
                <Icon className="h-4 w-4 text-muted-foreground mb-1" />
                <span className="text-xs text-muted-foreground text-center">{label}</span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
          </div>

          {/* Actions Section */}
          <div className="p-4 mt-4 bg-muted/30 space-y-2">
            {currentStatus === 'ACCEPTED' ? (
              <Button 
                variant="default" 
                className="w-full"
                onClick={() => router.push(`/messages/${user.id}`)}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Написать сообщение
              </Button>
            ) : currentStatus !== 'SELF' && (
              <AddFriendButton 
                targetUserId={user.id} 
                initialStatus={currentStatus}
                isReceivedRequest={isReceivedRequest}
                fullWidth
                className="justify-center"
              />
            )}
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => router.push(`/profile/${user.id}`)}
            >
              <User className="h-4 w-4 mr-2" />
              Открыть профиль
            </Button>
          </div>
        </Card>
      </PopoverContent>
    </Popover>
  )
} 