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
import { UserAvatar } from "@/components/user-avatar"
import type { ChatMessage } from "@/types/socket"

// Общий интерфейс для сообщений
interface BaseMessage {
  id: string
  content: string
  senderId: string
  sender: {
    name: string | null
    image: string | null
  }
}

// Расширенный интерфейс для сообщений из API
interface Message extends BaseMessage {
  recipientId: string
  createdAt: Date
}

// Функция для преобразования даты из строки в Date
function convertMessage(message: ChatMessage): Message {
  return {
    id: message.id,
    content: message.content,
    senderId: message.senderId,
    recipientId: message.recipientId,
    createdAt: new Date(message.createdAt),
    sender: message.sender
  }
}

interface MessageListProps {
  recipientId: string
  friendshipStatus?: 'NONE' | 'PENDING' | 'ACCEPTED' | 'REJECTED'
}

export function MessageList({ recipientId, friendshipStatus = 'NONE' }: MessageListProps) {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [isAddingFriend, setIsAddingFriend] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)
  const isFirstRenderRef = useRef(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Функция отправки запроса в друзья
  const handleAddFriend = async () => {
    try {
      setIsAddingFriend(true)
      const response = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: recipientId })
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
    if (!newMessage.trim() || isSending || !session?.user?.id) return

    try {
      setIsSending(true)
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newMessage,
          recipientId
        })
      })

      if (!response.ok) throw new Error('Failed to send message')
      
      const message: Message = await response.json()
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

    socketClient.emit('join_chat', recipientId)
    
    const handleNewMessage = (message: ChatMessage) => {
      // Преобразуем сообщение из сокета в нужный формат
      const convertedMessage = convertMessage(message)
      setMessages(prev => [...prev, convertedMessage])
    }

    socketClient.on('new_message', handleNewMessage)

    return () => {
      socketClient.emit('leave_chat', recipientId)
      socketClient.off('new_message', handleNewMessage)
    }
  }, [recipientId])

  // Загрузка сообщений
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/messages/${recipientId}`)
        if (!response.ok) throw new Error('Failed to fetch messages')
        const data = await response.json()
        // Преобразуем даты в полученных сообщениях
        const convertedMessages = data.map((msg: any) => ({
          ...msg,
          createdAt: new Date(msg.createdAt)
        }))
        setMessages(convertedMessages)
      } catch (error) {
        console.error('Error fetching messages:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMessages()
  }, [recipientId])

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
          <UserAvatar
            src={session?.user?.image}
            name={session?.user?.name}
            className="h-10 w-10"
          />
          <div>
            <h3 className="font-medium">{session?.user?.name}</h3>
            <div className="flex items-center gap-2">
              {friendshipStatus === 'ACCEPTED' ? (
                <div className="flex items-center text-green-500 text-sm">
                  <UserCheck className="h-4 w-4 mr-1" />
                  <span>В друзьях</span>
                  <Heart className="h-4 w-4 ml-2 text-red-400" />
                </div>
              ) : friendshipStatus === 'PENDING' ? (
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
                <UserAvatar
                  src={message.sender.image}
                  name={message.sender.name}
                  className="h-8 w-8"
                />
                
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
        <div ref={messagesEndRef} />
      </div>

      {/* Форма отправки сообщения */}
      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Введите сообщение..."
            disabled={friendshipStatus !== 'ACCEPTED'}
            className="flex-1"
          />
          <Button 
            type="submit"
            disabled={!newMessage.trim() || isSending || friendshipStatus !== 'ACCEPTED'}
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Отправить
          </Button>
        </div>
        {friendshipStatus !== 'ACCEPTED' && (
          <p className="text-sm text-muted-foreground mt-2">
            Чтобы начать общение, добавьте пользователя в друзья
          </p>
        )}
      </form>
    </div>
  )
} 