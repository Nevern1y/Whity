"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, MessageSquare, UserPlus, UserCheck, Clock } from "lucide-react"
import { AddFriendButton } from "@/components/add-friend-button"
import { MessageList } from "@/components/chat/message-list"
import { cn } from "@/lib/utils"
import { UserAvatar } from "@/components/user-avatar"
import { socketClient } from "@/lib/socket-client"
import { toast } from "react-hot-toast"
import { UsersList } from "@/components/users-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { User } from "@/types"
import { prisma } from "@/lib/prisma"

// Обновляем интерфейс Friend, чтобы он соответствовал User
interface Friend extends User {
  friendshipId?: string
}

export default function MessagesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [friends, setFriends] = useState<Friend[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const debouncedSearch = useDebounce(searchQuery, 300)
  const [activeTab, setActiveTab] = useState<"all" | "friends">("friends")
  const [friendsList, setFriendsList] = useState<User[]>([])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    const loadFriends = async () => {
      try {
        if (!session?.user?.id) return
        
        setIsLoading(true)
        const response = await fetch('/api/friends', {
          cache: 'force-cache', // Используем кэширование
        })
        
        if (!response.ok) throw new Error('Failed to load friends')
        
        const data = await response.json()
        setFriends(data)
        setFriendsList(data)
      } catch (error) {
        console.error('Error loading friends:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadFriends()
  }, [session?.user?.id])

  useEffect(() => {
    if (!session?.user?.id) return

    const socket = socketClient.getSocket()
    const userId = session.user.id // Capture the id in scope
    
    // Define handlers with guaranteed session context
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
    
    // Set up socket connection
    function setupSocket() {
      socket.emit('join_user', userId)
      socket.on('friend_request', handleFriendRequest)
      socket.on('friend_request_response', handleFriendRequestResponse)
    }

    setupSocket()

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

  const fetchFriends = async (query: string = "") => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`)
      const data = await response.json()
      setFriends(data)
    } catch (error) {
      console.error("Failed to fetch friends", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Используем debounce для поиска
  useEffect(() => {
    if (debouncedSearch !== undefined) {
      fetchFriends(debouncedSearch)
    }
  }, [debouncedSearch])

  // Отдельный эффект для начальной загрузки по userId из URL
  useEffect(() => {
    const userId = searchParams?.get('userId')
    if (userId && friends.length === 0) {
      fetchFriends()
    }
  }, [searchParams])

  const handleUserSelect = useCallback((user: User) => {
    setSelectedUser(user)
    console.log('Selected user friendship status:', {
      id: user.id,
      status: user.friendshipStatus
    })
    
    // Проверяем только основной статус
    if (user.friendshipStatus === 'ACCEPTED') {
      socketClient.emit('join_chat', user.id)
    }
  }, [])

  // Показываем загрузку пока проверяем сессию
  if (status === "loading") {
    return <div>Loading...</div>
  }

  // Не показываем контент неавторизованным пользователям
  if (!session) {
    return null
  }

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Список контактов */}
        <Card className="p-4 md:col-span-1 h-[700px] flex flex-col">
          <Tabs defaultValue="friends" className="w-full" onValueChange={(value) => setActiveTab(value as "all" | "friends")}>
            <TabsList className="w-full mb-4">
              <TabsTrigger value="friends" className="flex-1">
                <UserCheck className="w-4 h-4 mr-2" />
                Друзья
              </TabsTrigger>
              <TabsTrigger value="all" className="flex-1">
                <Search className="w-4 h-4 mr-2" />
                Поиск
              </TabsTrigger>
            </TabsList>

            <TabsContent value="friends" className="m-0">
              <ScrollArea className="h-[600px]">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <span>Загрузка...</span>
                  </div>
                ) : friendsList.length > 0 ? (
                  <UsersList 
                    users={friendsList.map(user => ({
                      ...user,
                      isOnline: user.isOnline || false,
                      friendshipStatus: user.friendshipStatus || 'NONE'
                    }))}
                    selectedUserId={selectedUser?.id}
                    onUserSelect={handleUserSelect}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <MessageSquare className="h-8 w-8 mb-2" />
                    <p>У вас пока нет друзей</p>
                    <a href="/friends" className="text-primary hover:underline">
                      Найти друзей
                    </a>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="all" className="m-0">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Поиск пользователей..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <ScrollArea className="h-[550px]">
                {/* Существующий код для отображения результатов поиска */}
                <UsersList 
                  users={friends}
                  selectedUserId={selectedUser?.id}
                  onUserSelect={handleUserSelect}
                />
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Область чата */}
        <Card className="md:col-span-3 h-[700px]">
          {selectedUser ? (
            <MessageList
              recipientId={selectedUser.id}
              recipient={{
                id: selectedUser.id,
                name: selectedUser.name,
                image: selectedUser.image,
                email: selectedUser.email,
                sentFriendships: selectedUser.sentFriendships,
                receivedFriendships: selectedUser.receivedFriendships
              }}
              friendshipStatus={
                selectedUser.friendshipStatus === 'ACCEPTED' ||
                selectedUser.sentFriendships?.some(f => f.status === 'ACCEPTED') ||
                selectedUser.receivedFriendships?.some(f => f.status === 'ACCEPTED')
                  ? 'ACCEPTED'
                  : selectedUser.friendshipStatus || 'NONE'
              }
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

// Хук для debounce
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

