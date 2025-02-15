"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
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
import { AnimatePresence } from "framer-motion"
import { useAnimation } from "@/components/providers/animation-provider"
import { listItem, staggerContainer } from "@/lib/framer-animations"
import type { FriendshipWithUsers } from "@/types/friends"

interface FriendsListProps {
  friendships: FriendshipWithUsers[]
  currentUserId: string
}

export function FriendsList({ friendships: initialFriendships, currentUserId }: FriendsListProps) {
  const [friendships, setFriendships] = useState(initialFriendships)
  const [pendingActions, setPendingActions] = useState<Set<string>>(new Set())
  const socket = useSocket()
  const { m } = useAnimation()

  // Filter out invalid friendships
  const validFriendships = friendships.filter(friendship => {
    const friend = friendship.senderId === currentUserId 
      ? friendship.receiver 
      : friendship.sender
    return friend && friend.id && (friend.name || friend.email)
  })

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
      }
    }

    socket.on(SOCKET_EVENTS.FRIENDSHIP_UPDATE, handleFriendshipUpdate)

    return () => {
      socket.off(SOCKET_EVENTS.FRIENDSHIP_UPDATE, handleFriendshipUpdate)
    }
  }, [socket])

  const handleRemoveFriend = async (friendshipId: string) => {
    try {
      setPendingActions(prev => new Set(prev).add(friendshipId))

      const response = await fetch(`/api/friendships/${friendshipId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to remove friend')
      }

      setFriendships(prev => prev.filter(f => f.id !== friendshipId))
      toast.success('Friend removed')
    } catch (error) {
      console.error('Error removing friend:', error)
      toast.error('Failed to remove friend')
    } finally {
      setPendingActions(prev => {
        const next = new Set(prev)
        next.delete(friendshipId)
        return next
      })
    }
  }

  if (validFriendships.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">У вас пока нет друзей</p>
      </div>
    )
  }

  if (!m) {
    return (
      <div className="space-y-4">
        {validFriendships.map(friendship => (
          <Card key={friendship.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-4">
                <Link 
                  href={`/profile/${friendship.senderId === currentUserId ? friendship.receiver.id : friendship.sender.id}`}
                  className="flex items-center gap-4 min-w-0 flex-1"
                >
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={(friendship.senderId === currentUserId ? friendship.receiver.image : friendship.sender.image) || undefined} />
                    <AvatarFallback>
                      {friendship.senderId === currentUserId ? friendship.receiver.name?.[0] || friendship.receiver.email?.[0] || '?' : friendship.sender.name?.[0] || friendship.sender.email?.[0] || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {friendship.senderId === currentUserId ? friendship.receiver.name || friendship.receiver.email : friendship.sender.name || friendship.sender.email}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {friendship.senderId === currentUserId ? friendship.receiver.email : friendship.sender.email}
                    </p>
                  </div>
                </Link>

                <div className="flex items-center gap-2">
                  {friendship.status === 'PENDING' && friendship.receiverId === currentUserId ? (
                    <FriendRequestActions friendshipId={friendship.id} />
                  ) : friendship.status === 'PENDING' ? (
                    <span className="text-sm text-muted-foreground">Ожидает подтверждения</span>
                  ) : (
                    <>
                      <Link href={`/messages/${friendship.senderId === currentUserId ? friendship.receiver.id : friendship.sender.id}`}>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8"
                        >
                          <MessageCircle className="h-4 w-4" />
                          <span className="sr-only">
                            Message {friendship.senderId === currentUserId ? friendship.receiver.name || 'friend' : friendship.sender.name || 'friend'}
                          </span>
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleRemoveFriend(friendship.id)}
                        disabled={pendingActions.has(friendship.id)}
                      >
                        {pendingActions.has(friendship.id) ? (
                          <Clock className="h-4 w-4 animate-spin" />
                        ) : (
                          <UserMinus className="h-4 w-4" />
                        )}
                        <span className="sr-only">
                          Remove {friendship.senderId === currentUserId ? friendship.receiver.name || 'friend' : friendship.sender.name || 'friend'}
                        </span>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <m.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-4"
    >
      <AnimatePresence mode="popLayout">
        {validFriendships.map(friendship => {
          const friend = friendship.senderId === currentUserId 
            ? friendship.receiver 
            : friendship.sender

          return (
            <m.div
              key={friendship.id}
              variants={listItem}
              exit={{ opacity: 0, x: -20 }}
              layout
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between gap-4">
                    <Link 
                      href={`/profile/${friend.id}`}
                      className="flex items-center gap-4 min-w-0 flex-1"
                    >
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={(friend.image) || undefined} />
                        <AvatarFallback>
                          {friend.name?.[0] || friend.email?.[0] || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {friend.name || friend.email}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {friend.email}
                        </p>
                      </div>
                    </Link>

                    <div className="flex items-center gap-2">
                      {friendship.status === 'PENDING' && friendship.receiverId === currentUserId ? (
                        <FriendRequestActions friendshipId={friendship.id} />
                      ) : friendship.status === 'PENDING' ? (
                        <span className="text-sm text-muted-foreground">Ожидает подтверждения</span>
                      ) : (
                        <>
                          <Link href={`/messages/${friend.id}`}>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MessageCircle className="h-4 w-4" />
                              <span className="sr-only">
                                Message {friend.name || 'friend'}
                              </span>
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleRemoveFriend(friendship.id)}
                            disabled={pendingActions.has(friendship.id)}
                          >
                            {pendingActions.has(friendship.id) ? (
                              <Clock className="h-4 w-4 animate-spin" />
                            ) : (
                              <UserMinus className="h-4 w-4" />
                            )}
                            <span className="sr-only">
                              Remove {friend.name || 'friend'}
                            </span>
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </m.div>
          )
        })}
      </AnimatePresence>
    </m.div>
  )
} 