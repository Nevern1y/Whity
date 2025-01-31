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

interface User {
  id: string
  name: string | null
  email: string | null
  image: string | null
  friendshipStatus: 'NONE' | 'PENDING' | 'ACCEPTED' | 'REJECTED'
}

export default function MessagesPage() {
  const { data: session } = useSession()
  const [searchQuery, setSearchQuery] = useState("")
  const [friends, setFriends] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
        friendshipStatus: user.friendshipStatus || 'NONE'
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
                    onClick={() => setSelectedUser(friend)}
                    className={cn(
                      "p-3 rounded-lg transition-all duration-200",
                      "hover:bg-muted cursor-pointer",
                      "border border-transparent",
                      selectedUser?.id === friend.id && "bg-muted border-border"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={friend.image || ''} alt={friend.name || ''} />
                        <AvatarFallback>{friend.name?.[0] || 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium truncate">{friend.name}</p>
                          {friend.friendshipStatus === 'ACCEPTED' && (
                            <UserCheck className="h-4 w-4 text-green-500 shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          {friend.friendshipStatus === 'NONE' ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs px-2 text-muted-foreground hover:text-foreground"
                              onClick={(e) => {
                                e.stopPropagation()
                                // handleAddFriend(friend.id)
                              }}
                            >
                              <UserPlus className="h-3 w-3 mr-1" />
                              Добавить в друзья
                            </Button>
                          ) : friend.friendshipStatus === 'PENDING' ? (
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Clock className="h-3 w-3 mr-1" />
                              Запрос отправлен
                            </div>
                          ) : null}
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
        <Card className="md:col-span-3 flex flex-col h-[700px] overflow-hidden">
          {selectedUser ? (
            <MessageList selectedUser={selectedUser} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <MessageSquare className="h-12 w-12 mb-4" />
              <p>Выберите пользователя для начала общения</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

