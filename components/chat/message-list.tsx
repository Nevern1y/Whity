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
import { UserPlus, UserCheck, Heart, Send, Loader2, X } from "lucide-react"
import { toast } from "sonner"
import { socketClient } from "@/lib/socket-client"
import { UserAvatar } from "@/components/user-avatar"
import { AddFriendButton } from "@/components/add-friend-button"
import type { ChatMessage } from "@/types/socket"
import Link from "next/link"
import { UserProfilePopover } from "@/components/user-profile-popover"

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
function convertMessage(message: ChatMessage, currentRecipientId: string): Message {
  return {
    id: message.id,
    content: message.content,
    senderId: message.senderId,
    recipientId: currentRecipientId,
    createdAt: new Date(message.createdAt),
    sender: message.sender
  }
}

interface MessageListProps {
  recipientId: string
  friendshipStatus?: 'NONE' | 'PENDING' | 'ACCEPTED' | 'REJECTED'
  onClose?: () => void
  recipient?: {
    id: string
    name: string | null
    image: string | null
  }
}

export function MessageList({ 
  recipientId, 
  friendshipStatus = 'NONE',
  recipient,
  onClose 
}: MessageListProps) {
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
    if (!recipientId || friendshipStatus !== 'ACCEPTED') return

    const socket = socketClient.getSocket()
    if (!socket) return

    socketClient.emit('join_chat', recipientId)
    
    const handleNewMessage = (message: ChatMessage) => {
      if (message.senderId === recipientId || message.senderId === session?.user?.id) {
        const convertedMessage = convertMessage(message, recipientId)
        setMessages(prev => [...prev, convertedMessage])
      }
    }

    socketClient.on('new_message', handleNewMessage)

    return () => {
      socketClient.emit('leave_chat', recipientId)
      socketClient.off('new_message', handleNewMessage)
    }
  }, [recipientId, friendshipStatus, session?.user?.id])

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

  // Если пользователи не друзья, показываем соответствующий интерфейс
  if (friendshipStatus !== 'ACCEPTED') {
    return (
      <div className="flex flex-col h-full bg-background">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <UserAvatar
              src={recipient?.image}
              name={recipient?.name}
              size="sm"
            />
            <div className="flex flex-col">
              <span className="font-medium">{recipient?.name || 'Пользователь'}</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-full transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="text-center space-y-4">
            {friendshipStatus === 'PENDING' ? (
              <>
                <p className="text-muted-foreground">
                  Дождитесь принятия заявки, чтобы начать общение
                </p>
                <Button variant="ghost" disabled>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Ожидание принятия заявки
                </Button>
              </>
            ) : (
              <>
                <p className="text-muted-foreground">
                  Добавьте пользователя в друзья, чтобы начать общение
                </p>
                <AddFriendButton 
                  targetUserId={recipientId}
                  initialStatus={friendshipStatus}
                />
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Обновим условие отображения формы отправки сообщений
  const canSendMessages = friendshipStatus === 'ACCEPTED'

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Шапка чата */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <UserAvatar
            src={session?.user?.image || null}
            name={session?.user?.name || null}
            size="sm"
          />
          <div className="flex flex-col">
            <span className="font-medium">{session?.user?.name || 'Пользователь'}</span>
            <UserProfilePopover
              user={{
                id: recipientId,
                name: session?.user?.name || null,
                image: session?.user?.image || null,
                role: session?.user?.role || undefined,
                coursesCompleted: session?.user?.coursesCompleted,
                achievementsCount: session?.user?.achievementsCount
              }}
              friendshipStatus={friendshipStatus}
              trigger={
                <button className="text-xs text-muted-foreground hover:underline text-left">
                  Посмотреть профиль
                </button>
              }
            />
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-accent rounded-full transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Список сообщений */}
      <div 
        ref={listRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <p>Нет сообщений</p>
          </div>
        ) : (
          messages.map((message) => {
            const isCurrentUser = message.senderId === session?.user?.id
            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex items-start gap-2 max-w-[80%]",
                  isCurrentUser ? "ml-auto flex-row-reverse" : ""
                )}
              >
                <UserAvatar
                  src={message.sender.image}
                  name={message.sender.name}
                  size="sm"
                />
                <div
                  className={cn(
                    "rounded-2xl px-4 py-2",
                    isCurrentUser
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  <p>{message.content}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {format(new Date(message.createdAt), "HH:mm", { locale: ru })}
                  </span>
                </div>
              </motion.div>
            )
          })
        )}
      </div>

      {/* Форма отправки */}
      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex items-center gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Введите сообщение..."
            disabled={!canSendMessages}
            className="flex-1"
          />
          <button 
            type="submit"
            disabled={!newMessage.trim() || isSending || !canSendMessages}
            className={cn(
              "p-2 rounded-full transition-colors",
              "hover:bg-primary hover:text-primary-foreground",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {isSending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>
      </form>
    </div>
  )
} 