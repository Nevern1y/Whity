"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare, Search, UserCheck } from "lucide-react"
import { MessageList } from "@/components/chat/message-list"
import { UsersList } from "@/components/users-list"
import { useSocket } from "@/hooks/use-socket"
import { ClientOnly } from "@/components/client-only"
import { QueryProvider } from "@/components/providers/query-provider"

export default function MessagesPage() {
  const { data: session, status } = useSession()
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [friendsList, setFriendsList] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"all" | "friends">("friends")
  const searchParams = useSearchParams()
  const socket = useSocket()

  useEffect(() => {
    const userId = searchParams?.get("userId")
    if (userId) {
      fetchUserDetails(userId)
    }
  }, [searchParams])

  useEffect(() => {
    fetchFriends()
  }, [])

  const fetchUserDetails = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`)
      if (!response.ok) throw new Error('Failed to fetch user details')
      const userData = await response.json()
      setSelectedUser(userData)
    } catch (error) {
      console.error('Error fetching user details:', error)
    }
  }

  const fetchFriends = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/friends')
      if (!response.ok) throw new Error('Failed to fetch friends')
      const data = await response.json()
      
      // Transform friendships into a list of users and filter out current user
      const friends = data
        .filter((friendship: any) => friendship.status === 'ACCEPTED')
        .map((friendship: any) => {
          const friend = friendship.senderId === session?.user?.id
            ? friendship.receiver
            : friendship.sender
          return {
            ...friend,
            friendshipStatus: friendship.status
          }
        })
        .filter((friend: any) => friend.id !== session?.user?.id)
      
      setFriendsList(friends)
    } catch (error) {
      console.error('Error fetching friends:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUserSelect = (user: any) => {
    setSelectedUser(user)
  }

  if (status === "loading") {
    return null
  }

  if (!session) {
    return null
  }

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Contacts List */}
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
              <div className="flex flex-col items-center justify-center h-[600px] text-muted-foreground">
                <Search className="h-8 w-8 mb-2" />
                <p>Поиск пользователей</p>
                <p className="text-sm">Скоро будет доступен</p>
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Chat Area */}
        <Card className="md:col-span-3 h-[700px]">
          <ClientOnly>
            <QueryProvider>
              {selectedUser ? (
                <MessageList
                  recipientId={selectedUser.id}
                  recipient={{
                    id: selectedUser.id,
                    name: selectedUser.name,
                    image: selectedUser.image,
                    email: selectedUser.email,
                  }}
                  friendshipStatus={
                    selectedUser.friendshipStatus === 'ACCEPTED' ||
                    selectedUser.sentFriendships?.some((f: any) => f.status === 'ACCEPTED') ||
                    selectedUser.receivedFriendships?.some((f: any) => f.status === 'ACCEPTED')
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
            </QueryProvider>
          </ClientOnly>
        </Card>
      </div>
    </div>
  )
}

