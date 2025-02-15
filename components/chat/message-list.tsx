"use client"

import { useEffect, useRef, useState } from "react"
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query"
import { useVirtualizer } from "@tanstack/react-virtual"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useSession } from "next-auth/react"
import { Send, Loader2, X } from "lucide-react"
import { toast } from "sonner"
import { UserAvatar } from "@/components/user-avatar"
import { UserProfilePopover } from "@/components/user-profile-popover"
import { UserOnlineStatus } from "@/components/user-online-status"
import { useRouter } from "next/navigation"
import { useSocket } from "@/hooks/use-socket"

interface Message {
  id: string
  content: string
  senderId: string
  receiverId: string
  createdAt: string | Date
  sender: {
    id: string
    name: string | null
    image: string | null
  }
}

interface MessageResponse {
  messages: Message[]
  nextCursor?: string
  recipient: {
    isOnline: boolean
    lastActive: string | null
  } | null
  error?: string
}

interface MessageListProps {
  recipientId: string
  recipient: {
    id: string
    name: string | null
    image: string | null
    email: string | null
    isOnline?: boolean
  }
  friendshipStatus?: string
  onClose: () => void
}

export function MessageList({ recipientId, recipient, friendshipStatus, onClose }: MessageListProps) {
  const { data: session } = useSession()
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const parentRef = useRef<HTMLDivElement>(null)
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true)
  const router = useRouter()
  const queryClient = useQueryClient()
  const socket = useSocket()

  // Fetch messages with infinite query
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    error
  } = useInfiniteQuery<MessageResponse, Error>({
    queryKey: ['messages', recipientId],
    queryFn: async ({ pageParam }) => {
      const res = await fetch(`/api/messages/${recipientId}?cursor=${pageParam || ''}`)
      const data = await res.json()
      
      if (!res.ok) {
        if (res.status === 404) {
          toast.error('Пользователь не найден')
          router.push('/friends')
          throw new Error('User not found')
        }
        throw new Error(data.error || 'Failed to fetch messages')
      }
      
      return data
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: null,
    retry: false,
  })

  // Flatten messages from all pages
  const messages = data?.pages.flatMap(page => page.messages) || []
  const recipientStatus = data?.pages[0]?.recipient

  // Setup virtualizer
  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 70,
    overscan: 5,
  })

  // Socket event listener for new messages
  useEffect(() => {
    if (!socket) return

    const handleNewMessage = (message: Message) => {
      // Only handle messages for this chat
      if (message.senderId !== recipientId && message.receiverId !== recipientId) return

      queryClient.setQueryData(['messages', recipientId], (oldData: any) => {
        if (!oldData?.pages?.[0]) return oldData
        const newPages = [...oldData.pages]
        newPages[0] = {
          ...newPages[0],
          messages: [...newPages[0].messages, message]
        }
        return {
          ...oldData,
          pages: newPages
        }
      })

      // Scroll to bottom when new message arrives
      setShouldScrollToBottom(true)
    }

    socket.on('new_message', handleNewMessage)
    
    return () => {
      socket.off('new_message', handleNewMessage)
    }
  }, [socket, recipientId, queryClient])

  // Handle scroll
  useEffect(() => {
    const container = parentRef.current
    if (!container) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100
      setShouldScrollToBottom(isNearBottom)

      // Load more messages when scrolling up
      if (scrollTop === 0 && hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  // Scroll to bottom on new messages
  useEffect(() => {
    if (shouldScrollToBottom && parentRef.current) {
      parentRef.current.scrollTop = parentRef.current.scrollHeight
    }
  }, [messages.length, shouldScrollToBottom])

  // Send message
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || isLoading) return

    try {
      setIsLoading(true)
      const response = await fetch(`/api/messages/${recipientId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newMessage.trim()
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        if (response.status === 404) {
          toast.error('Пользователь не найден')
          router.push('/friends')
          return
        }
        if (response.status === 403) {
          toast.error('Нужно быть друзьями для обмена сообщениями')
          return
        }
        throw new Error(data.error || 'Failed to send message')
      }

      const newMessageData = await response.json()
      
      // Optimistically update the messages list
      queryClient.setQueryData(['messages', recipientId], (oldData: any) => {
        if (!oldData?.pages?.[0]) return oldData
        const newPages = [...oldData.pages]
        newPages[0] = {
          ...newPages[0],
          messages: [...newPages[0].messages, newMessageData]
        }
        return {
          ...oldData,
          pages: newPages
        }
      })

      setNewMessage("")
      setShouldScrollToBottom(true)
    } catch (error) {
      toast.error("Не удалось отправить сообщение")
    } finally {
      setIsLoading(false)
    }
  }

  const renderContent = () => {
    if (status === 'pending') {
      return (
        <div className="flex justify-center items-center h-full">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )
    }

    if (status === 'error') {
      if (error?.message === 'User not found') {
        return (
          <div className="flex flex-col justify-center items-center h-full gap-4">
            <p className="text-destructive">
              Пользователь не найден
            </p>
            <Button onClick={() => router.push('/friends')}>
              Вернуться к списку друзей
            </Button>
          </div>
        )
      }

      return (
        <div className="flex justify-center items-center h-full text-destructive">
          Ошибка загрузки сообщений
        </div>
      )
    }

    return (
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const message = messages[virtualRow.index]
          const isOwnMessage = message.senderId === session?.user?.id
          
          return (
            <div
              key={message.id}
              ref={virtualizer.measureElement}
              data-index={virtualRow.index}
              className={cn(
                "flex gap-2 mb-4",
                isOwnMessage ? "flex-row-reverse" : "flex-row"
              )}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {!isOwnMessage && (
                <UserAvatar
                  user={{
                    name: message.sender.name,
                    image: message.sender.image,
                  }}
                  className="h-8 w-8 flex-shrink-0"
                />
              )}
              <div
                className={cn(
                  "rounded-lg p-3 max-w-[70%] break-words",
                  isOwnMessage
                    ? "bg-primary text-primary-foreground ml-auto"
                    : "bg-muted"
                )}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <span className={cn(
                  "text-[10px] mt-1 block",
                  isOwnMessage ? "text-primary-foreground/70" : "text-muted-foreground"
                )}>
                  {format(new Date(message.createdAt), 'HH:mm', { locale: ru })}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const userWithOnline = {
    ...recipient,
    isOnline: recipientStatus?.isOnline ?? false,
    role: 'USER',
    coursesCompleted: 0,
    achievementsCount: 0,
  }

  const avatarTrigger = (
    <div className="relative cursor-pointer">
      <UserAvatar
        user={{
          name: recipient.name,
          image: recipient.image,
        }}
        className="h-10 w-10 flex-shrink-0"
      />
      <span className={cn(
        "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background",
        recipientStatus?.isOnline ? "bg-green-500" : "bg-red-500"
      )} />
    </div>
  )

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-card">
        <div className="flex items-center gap-3 min-w-0">
          <UserProfilePopover 
            user={userWithOnline}
            trigger={avatarTrigger}
          />
          <div className="min-w-0 flex-1">
            <p className="font-medium truncate">{recipient.name}</p>
            <UserOnlineStatus 
              isOnline={recipientStatus?.isOnline ?? false}
              showDot={false}
              className="text-xs"
            />
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="flex-shrink-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <div
        ref={parentRef}
        className="flex-1 overflow-auto p-4"
        style={{ height: 'calc(100vh - 180px)' }}
      >
        {renderContent()}
      </div>

      {/* Input */}
      {friendshipStatus === 'ACCEPTED' ? (
        <form onSubmit={sendMessage} className="p-4 border-t bg-card">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Введите сообщение..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              type="submit" 
              disabled={isLoading || !newMessage.trim()}
              className="flex-shrink-0"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
      ) : (
        <div className="p-4 border-t bg-card text-center text-sm text-muted-foreground">
          Чтобы отправлять сообщения, нужно добавить пользователя в друзья
        </div>
      )}
    </div>
  )
} 