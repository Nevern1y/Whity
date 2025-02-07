"use client"

import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import { 
  MessageCircle, 
  UserMinus, 
  Clock
} from "lucide-react"
import { useSocket } from "@/hooks/use-socket"
import { SOCKET_EVENTS } from "@/components/providers/socket-provider"
import { FriendRequestActions } from "@/components/friend-request-actions"
import { FriendshipStatusBadge } from "@/components/friendship-status-badge"
import { motion } from "framer-motion"

interface FriendshipWithUsers {
  id: string
  senderId: string
  receiverId: string
  status: string
  sender: {
    id: string
    name: string | null
    email: string | null
    image: string | null
  }
  receiver: {
    id: string
    name: string | null
    email: string | null
    image: string | null
  }
}

interface FriendsListProps {
  friendships: FriendshipWithUsers[]
  currentUserId: string
}

export function FriendsList({ friendships: initialFriendships, currentUserId }: FriendsListProps) {
  const [friendships, setFriendships] = useState(initialFriendships)
  const [pendingActions, setPendingActions] = useState<Set<string>>(new Set())
  const { toast } = useToast()
  const socket = useSocket()

  useEffect(() => {
    if (!socket) return

    const handleFriendshipUpdate = (data: any) => {
      if (data.type === 'REMOVED') {
        setFriendships(prev => prev.filter(f => f.id !== data.friendshipId))
      } else if (data.type === 'ACCEPTED') {
        setFriendships(prev => 
          prev.map(f => 
            f.id === data.friendshipId 
              ? { ...f, status: 'ACCEPTED' } 
              : f
          )
        )
      } else if (data.type === 'REJECTED') {
        setFriendships(prev => prev.filter(f => f.id !== data.friendshipId))
      }
    }

    socket.on(SOCKET_EVENTS.FRIENDSHIP_UPDATE, handleFriendshipUpdate)
    
    return () => {
      socket.off(SOCKET_EVENTS.FRIENDSHIP_UPDATE, handleFriendshipUpdate)
    }
  }, [socket])

  const handleAcceptFriend = async (friendshipId: string) => {
    try {
      setPendingActions(prev => new Set(prev).add(friendshipId))
      const res = await fetch(`/api/friends/${friendshipId}/accept`, {
        method: 'PATCH'
      })

      if (!res.ok) throw new Error('Failed to accept friend request')

      setFriendships(prev => 
        prev.map(f => 
          f.id === friendshipId 
            ? { ...f, status: 'ACCEPTED' } 
            : f
        )
      )

      toast({
        title: "Запрос принят",
        description: "Вы теперь друзья!",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось принять запрос в друзья",
      })
    } finally {
      setPendingActions(prev => {
        const next = new Set(prev)
        next.delete(friendshipId)
        return next
      })
    }
  }

  const handleRejectFriend = async (friendshipId: string) => {
    try {
      setPendingActions(prev => new Set(prev).add(friendshipId))
      const res = await fetch(`/api/friends/${friendshipId}/reject`, {
        method: 'PATCH'
      })

      if (!res.ok) throw new Error('Failed to reject friend request')

      setFriendships(prev => prev.filter(f => f.id !== friendshipId))

      toast({
        title: "Запрос отклонен",
        description: "Запрос в друзья отклонен",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось отклонить запрос в друзья",
      })
    } finally {
      setPendingActions(prev => {
        const next = new Set(prev)
        next.delete(friendshipId)
        return next
      })
    }
  }

  const handleRemoveFriend = async (friendshipId: string) => {
    try {
      setPendingActions(prev => new Set(prev).add(friendshipId))
      const res = await fetch(`/api/friends/${friendshipId}`, {
        method: 'DELETE'
      })

      if (!res.ok) throw new Error('Failed to remove friend')

      setFriendships(prev => prev.filter(f => f.id !== friendshipId))

      toast({
        title: "Друг удален",
        description: "Пользователь удален из списка друзей",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось удалить друга",
      })
    } finally {
      setPendingActions(prev => {
        const next = new Set(prev)
        next.delete(friendshipId)
        return next
      })
    }
  }

  return (
    <div className="space-y-4">
      {friendships.map((friendship) => {
        const friend = friendship.senderId === currentUserId 
          ? friendship.receiver 
          : friendship.sender

        if (!friend) return null

        const isPending = friendship.status === 'PENDING'
        const isIncoming = isPending && friendship.receiverId === currentUserId

        return (
          <Card key={friendship.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={friend.image || ""} />
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <Link 
                      href={`/profile/${friend.id}`}
                      className="font-medium hover:underline truncate block"
                    >
                      {friend.name || friend.email || "Пользователь"}
                    </Link>
                    <FriendshipStatusBadge 
                      status={friendship.status as any}
                      isIncoming={friendship.receiver?.id === friend.id}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isPending ? (
                    isIncoming ? (
                      <FriendRequestActions friendshipId={friendship.id} />
                    ) : (
                      <Button variant="ghost" size="sm" disabled className="gap-2">
                        <motion.div
                          animate={{ 
                            rotate: 360
                          }}
                          transition={{ 
                            duration: 2,
                            repeat: Infinity,
                            ease: "linear"
                          }}
                          style={{ 
                            willChange: "transform"
                          }}
                        >
                          <Clock className="h-4 w-4" />
                        </motion.div>
                        <span>Ожидание ответа</span>
                      </Button>
                    )
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => window.location.href = `/messages?userId=${friend.id}`}
                      >
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveFriend(friendship.id)}
                      >
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
} 