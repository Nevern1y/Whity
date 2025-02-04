"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, MessageSquare, UserPlus, UserCheck, Clock } from "lucide-react"
import { AddFriendButton } from "@/components/add-friend-button"
import { MessageList } from "@/components/chat/message-list"
import { cn } from "@/lib/utils"
import { UserAvatar } from "@/components/user-avatar"
import { useSearchParams } from "next/navigation"
import { socketClient } from "@/lib/socket-client"
import { toast } from "react-hot-toast"

interface FriendshipData {
  id: string
  status: 'NONE' | 'PENDING' | 'ACCEPTED' | 'REJECTED'
}

interface User {
  id: string
  name: string | null
  email: string | null
  image: string | null
  friendshipStatus: 'NONE' | 'PENDING' | 'ACCEPTED' | 'REJECTED'
  isIncoming?: boolean
  sentFriendships?: FriendshipData[]
  receivedFriendships?: FriendshipData[]
}

export default function MessagesPage() {
  const { data: session } = useSession()
  const [searchQuery, setSearchQuery] = useState("")
  const [friends, setFriends] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!session?.user?.id) return

    const socket = socketClient.getSocket()
    if (!socket) return

    const userId = session.user.id
    socket.emit('join_user', userId)

    const handleFriendRequest = (data: { senderId: string; status: 'NONE' | 'PENDING' | 'ACCEPTED' | 'REJECTED' }) => {
      setFriends(prev => prev.map(friend => 
        friend.id === data.senderId 
          ? { ...friend, friendshipStatus: data.status }
          : friend
      ))
    }

    const handleFriendRequestResponse = (data: { friendshipId: string; status: 'NONE' | 'PENDING' | 'ACCEPTED' | 'REJECTED' }) => {
      setFriends(prev => prev.map(friend => {
        const friendship = friend.sentFriendships?.[0] || friend.receivedFriendships?.[0]
        if (friendship?.id === data.friendshipId) {
          return { ...friend, friendshipStatus: data.status }
        }
        return friend
      }))

      if (data.status === 'ACCEPTED') {
        toast.success('Запрос в друзья принят')
      }
    }

    socket.on('friend_request', handleFriendRequest)
    socket.on('friend_request_response', handleFriendRequestResponse)

    return () => {
      socket.emit('leave_user', userId)
      socket.off('friend_request', handleFriendRequest)
      socket.off('friend_request_response', handleFriendRequestResponse)
    }
  }, [session?.user?.id])

  const handleAddFriend = async (friendId: string) => {
    try {
      const res = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: friendId })
      })
      
      if (!res.ok) {
        const error = await res.json()
        toast.error(error.error || 'Не удалось добавить в друзья')
        return
      }

      const data = await res.json()
      
      setFriends(prev => prev.map(friend => 
        friend.id === friendId 
          ? { 
              ...friend, 
              friendshipStatus: 'PENDING',
              sentFriendships: [{ id: data.id, status: 'PENDING' }],
              receivedFriendships: []
            }
          : friend
      ))
      
      toast.success('Запрос в друзья отправлен')
    } catch (error) {
      console.error("Failed to add friend", error)
      toast.error('Не удалось добавить в друзья')
    }
  }

  const handleAcceptFriend = async (friendId: string) => {
    try {
      const res = await fetch(`/api/friends/${friendId}/accept`, { method: "PATCH" })
      if (res.ok) {
        setFriends(friends.map(friend => 
          friend.id === friendId 
            ? { ...friend, friendshipStatus: 'ACCEPTED' } 
            : friend
        ))
      }
    } catch (error) {
      console.error("Failed to accept friend", error)
    }
  }

  const handleRejectFriend = async (friendId: string) => {
    try {
      const res = await fetch(`/api/friends/${friendId}/reject`, { method: "PATCH" })
      if (res.ok) {
        setFriends(friends.map(friend => friend.id === friendId ? { ...friend, friendshipStatus: 'REJECTED' } : friend))
        if (selectedUser?.id === friendId) {
          setSelectedUser(null)
        }
      }
    } catch (error) {
      console.error("Failed to reject friend", error)
    }
  }

  const fetchFriends = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch(`/api/users/search?q=${searchQuery}`)
      
      if (!response.ok) {
        throw new Error(
          response.status === 401 
            ? 'Пожалуйста, войдите в систему' 
            : 'Ошибка при поиске пользователей'
        )
      }
      
      const data = await response.json()
      const usersWithStatus = data.map((user: any) => ({
        ...user,
        friendshipStatus: user.friendshipStatus || 'NONE',
        isIncoming: user.isIncoming ?? false,
      }))
      setFriends(usersWithStatus)
    } catch (error) {
      console.error('Error:', error)
      setError(error instanceof Error ? error.message : 'Произошла ошибка')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery) fetchFriends()
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery])

  useEffect(() => {
    // Если есть userId в URL, находим и выбираем этого пользователя
    const userId = searchParams?.get('userId')
    if (userId && friends.length > 0) {
      const user = friends.find(friend => friend.id === userId)
      if (user) {
        setSelectedUser(user)
      }
    }
    // Если userId есть, но пользователь не найден в списке друзей,
    // можно загрузить информацию о пользователе
    else if (userId) {
      fetchFriends()
    }
  }, [searchParams, friends])

  const handleRemoveFriend = async (friendId: string) => {
    try {
      const res = await fetch(`/api/friends/${friendId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setFriends(friends.filter(friend => friend.id !== friendId));
      }
    } catch (error) {
      console.error("Failed to remove friend", error);
    }
  }

  const handleUserSelect = (user: User) => {
    setSelectedUser(user)
    // Проверяем статус дружбы
    if (user.friendshipStatus === 'ACCEPTED') {
      socketClient.emit('join_chat', user.id)
    }
  }

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Список контактов */}
        <Card className="p-4 md:col-span-1 h-[700px] flex flex-col">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Поиск пользователей..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex-1 overflow-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full text-destructive">
                <p>{error}</p>
              </div>
            ) : friends.length > 0 ? (
              <div className="space-y-3">
                {friends.map((friend) => (
                  <div
                    key={friend.id}
                    onClick={() => friend.name && handleUserSelect(friend)}
                    className={cn(
                      "p-3 rounded-lg transition-all duration-200",
                      friend.name ? "hover:bg-muted cursor-pointer" : "pointer-events-none opacity-50",
                      "border border-transparent",
                      selectedUser?.id === friend.id && "bg-muted border-border"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <UserAvatar
                        src={friend.image}
                        name={friend.name}
                        className="h-10 w-10"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium truncate">{friend.name || "Нет данных"}</p>
                          <div className="flex items-center gap-2">
                            {friend.friendshipStatus === 'ACCEPTED' ? (
                              <UserCheck className="h-4 w-4 text-green-500 shrink-0" />
                            ) : friend.friendshipStatus === 'PENDING' ? (
                              friend.isIncoming ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleAcceptFriend(friend.id)
                                  }}
                                >
                                  Принять
                                </Button>
                              ) : (
                                <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                              )
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleAddFriend(friend.id)
                                }}
                              >
                                <UserPlus className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : searchQuery ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <p>Пользователи не найдены</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <p>Начните поиск пользователей</p>
              </div>
            )}
          </div>
        </Card>

        {/* Область чата */}
        <Card className="md:col-span-3 h-[700px]">
          {selectedUser ? (
            <MessageList
              recipientId={selectedUser.id}
              friendshipStatus={selectedUser.friendshipStatus}
              recipient={{
                id: selectedUser.id,
                name: selectedUser.name,
                image: selectedUser.image
              }}
              onClose={() => setSelectedUser(null)}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Выберите чат для начала общения
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

