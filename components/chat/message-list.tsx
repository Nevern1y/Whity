"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useSession } from "next-auth/react"
import { UserPlus, UserCheck, Heart, Send, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { socketClient } from "@/lib/socket-client"
import type { ChatMessage } from "@/types/socket"

interface Message extends ChatMessage {
  // дополнительные поля, если нужны
}

interface MessageListProps {
  selectedUser: {
    id: string
    name: string | null
    image: string | null
    friendshipStatus: 'NONE' | 'PENDING' | 'ACCEPTED' | 'REJECTED'
  }
}

export function MessageList({ selectedUser }: MessageListProps) {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [isAddingFriend, setIsAddingFriend] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)
  const isFirstRenderRef = useRef(true)

  // Функция отправки запроса в друзья
  const handleAddFriend = async () => {
    try {
      setIsAddingFriend(true)
      const response = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: selectedUser.id })
      })

      if (!response.ok) throw new Error('Failed to send friend request')
      toast.success('Запрос в друзья отправлен')
    } catch (error) {
      toast.error('Не удалось отправить запрос')
    } finally {
      setIsAddingFriend(false)
    }
  }

  // Функция отправки сообщения
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || isSending) return

    try {
      setIsSending(true)
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          receiverId: selectedUser.id,
          content: newMessage 
        })
      })

      if (!response.ok) throw new Error('Failed to send message')
      
      const message = await response.json()
      setMessages(prev => [...prev, message])
      setNewMessage("")
    } catch (error) {
      toast.error('Не удалось отправить сообщение')
    } finally {
      setIsSending(false)
    }
  }

  useEffect(() => {
    const socket = socketClient.getSocket()
    if (!socket) return

    socketClient.emit('join_chat', selectedUser.id)
    
    const handleNewMessage = (message: ChatMessage) => {
      setMessages(prev => [...prev, message])
    }

    socketClient.on('new_message', handleNewMessage)

    return () => {
      socketClient.emit('leave_chat', selectedUser.id)
      socketClient.off('new_message', handleNewMessage)
    }
  }, [selectedUser.id])

  // Заменяем polling на сокеты
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/messages/${selectedUser.id}`)
        if (!response.ok) throw new Error('Failed to fetch messages')
        const data = await response.json()
        setMessages(data)
      } catch (error) {
        console.error('Error fetching messages:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMessages()
    // Убираем интервал, так как теперь используем сокеты
  }, [selectedUser.id])

  // Предотвращаем автоскролл при первом рендере
  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false
      return
    }

    // Скроллим только если пользователь уже находится внизу
    const list = listRef.current
    if (list) {
      const isAtBottom = 
        list.scrollHeight - list.scrollTop === list.clientHeight

      if (isAtBottom) {
        list.scrollTop = list.scrollHeight
      }
    }
  }, [messages])

  return (
    <div className="flex flex-col h-full">
      {/* Шапка чата */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={selectedUser.image || undefined} />
            <AvatarFallback>{selectedUser.name?.[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{selectedUser.name}</h3>
            <div className="flex items-center gap-2">
              {selectedUser.friendshipStatus === 'ACCEPTED' ? (
                <div className="flex items-center text-green-500 text-sm">
                  <UserCheck className="h-4 w-4 mr-1" />
                  <span>В друзьях</span>
                  <Heart className="h-4 w-4 ml-2 text-red-400" />
                </div>
              ) : selectedUser.friendshipStatus === 'PENDING' ? (
                <span className="text-sm text-muted-foreground">
                  Запрос в друзья отправлен
                </span>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleAddFriend}
                  disabled={isAddingFriend}
                >
                  {isAddingFriend ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <UserPlus className="h-4 w-4 mr-2" />
                  )}
                  Добавить в друзья
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Список сообщений */}
      <div 
        ref={listRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <p>Начните общение первым</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isCurrentUser = message.senderId === session?.user?.id
            
            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex items-end gap-2 max-w-[80%]",
                  isCurrentUser ? "ml-auto flex-row-reverse" : ""
                )}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={message.sender.image || undefined} />
                  <AvatarFallback>
                    {message.sender.name?.[0]?.toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
                
                <div
                  className={cn(
                    "rounded-2xl p-4",
                    isCurrentUser
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  <p className="text-sm">{message.content}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {format(new Date(message.createdAt), "HH:mm", { locale: ru })}
                  </span>
                </div>
              </motion.div>
            )
          })
        )}
      </div>

      {/* Форма отправки сообщения */}
      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Введите сообщение..."
            disabled={selectedUser.friendshipStatus !== 'ACCEPTED'}
          />
          <Button 
            type="submit"
            disabled={!newMessage.trim() || isSending || selectedUser.friendshipStatus !== 'ACCEPTED'}
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Отправить
          </Button>
        </div>
        {selectedUser.friendshipStatus !== 'ACCEPTED' && (
          <p className="text-sm text-muted-foreground mt-2">
            Чтобы начать общение, добавьте пользователя в друзья
          </p>
        )}
      </form>
    </div>
  )
} 