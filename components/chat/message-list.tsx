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
import { UserOnlineStatus } from "@/components/user-online-status"

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
  friendshipStatus: string
  recipient: {
    id: string
    name: string | null
    image: string | null
    email: string | null
  }
  onClose: () => void
}

export function MessageList({ recipientId, friendshipStatus, recipient, onClose }: MessageListProps) {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [recipientStatus, setRecipientStatus] = useState({ isOnline: false, lastActive: null })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const res = await fetch(`/api/messages/${recipientId}`)
        const data = await res.json()
        setMessages(data.messages)
        setRecipientStatus(data.recipient)
      } catch (error) {
        console.error('Failed to load messages:', error)
      }
    }
    
    loadMessages()
    // Обновляем каждые 30 секунд
    const interval = setInterval(loadMessages, 30000)
    
    return () => clearInterval(interval)
  }, [recipientId])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || isLoading) return

    try {
      setIsLoading(true)
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newMessage.trim(),
          receiverId: recipientId
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to send message")
      }

      const message = await response.json()
      setMessages(prev => [...prev, message])
      setNewMessage("")
      setTimeout(scrollToBottom, 100)
    } catch (error) {
      console.error("Error sending message:", error)
      toast.error("Не удалось отправить сообщение")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-card shadow-sm">
        <div 
          className="flex items-center gap-3 cursor-pointer group relative"
          onClick={() => window.open(`/profile/${recipient.id}`, '_blank')}
        >
          <div className="relative">
            <UserAvatar
              user={recipient}
              className="h-10 w-10 transition-transform group-hover:scale-105"
            />
            <span className={cn(
              "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background",
              recipientStatus.isOnline ? "bg-green-500" : "bg-red-500"
            )} />
          </div>
          <div className="group-hover:opacity-80 transition-opacity">
            <p className="font-medium line-clamp-1 flex items-center gap-2">
              {recipient.name}
              <span className="text-xs text-muted-foreground/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </span>
            </p>
            <UserOnlineStatus 
              isOnline={recipientStatus.isOnline}
              showDot={false}
              className="text-xs"
            />
          </div>

          {/* Quick Profile Preview - улучшенный дизайн */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            <div className="bg-popover text-popover-foreground rounded-lg shadow-lg w-80 border overflow-hidden">
              {/* Градиентный фон */}
              <div className="h-32 bg-gradient-to-br from-primary/20 via-primary/10 to-background relative">
                {/* Аватар */}
                <div className="absolute left-1/2 -bottom-12 -translate-x-1/2">
                  <div className="p-1.5 bg-background rounded-full ring-4 ring-background">
                    <UserAvatar
                      user={recipient}
                      className="h-20 w-20"
                    />
                  </div>
                </div>
              </div>

              {/* Информация о пользователе */}
              <div className="pt-14 pb-4 px-4">
                <div className="text-center space-y-1">
                  <h3 className="font-semibold text-lg">{recipient.name}</h3>
                  <p className="text-sm text-muted-foreground">{recipient.email || 'Email не указан'}</p>
                  <div className="flex items-center justify-center mt-2">
                    <span className={cn(
                      "relative flex h-2.5 w-2.5 mr-2",
                    )}>
                      <span className={cn(
                        "absolute inline-flex h-full w-full rounded-full",
                        recipientStatus.isOnline ? "bg-green-500" : "bg-red-500/50"
                      )}/>
                      {recipientStatus.isOnline && (
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"/>
                      )}
                    </span>
                    <span className={cn(
                      "text-sm",
                      recipientStatus.isOnline ? "text-green-500" : "text-red-500"
                    )}>
                      {recipientStatus.isOnline ? "В сети" : "Не в сети"}
                      {!recipientStatus.isOnline && recipientStatus.lastActive && (
                        <span className="text-xs text-muted-foreground ml-1">
                          (Был(а) в сети {format(new Date(recipientStatus.lastActive), 'dd.MM.yyyy HH:mm', { locale: ru })})
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Статус и информация */}
                <div className="mt-4 flex justify-center gap-6">
                  {friendshipStatus === 'ACCEPTED' && (
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1.5 text-sm">
                        <UserCheck className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground">В друзьях</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Разделитель */}
                <div className="my-4 border-t border-border/40" />

                {/* Действия */}
                <div className="flex gap-2 px-2">
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation()
                      window.open(`/profile/${recipient.id}`, '_blank')
                    }}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Профиль
                  </Button>
                  {friendshipStatus !== 'ACCEPTED' && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation()
                        // Здесь логика добавления в друзья
                      }}
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      Добавить
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose} 
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-background to-muted/20">
        {messages.map((message, index) => {
          const isCurrentUser = message.senderId === session?.user?.id
          const showAvatar = !isCurrentUser && 
            (!messages[index - 1] || messages[index - 1].senderId !== message.senderId)

          return (
            <div
              key={message.id}
              className={cn(
                "flex items-end gap-2",
                isCurrentUser ? "justify-end" : "justify-start"
              )}
            >
              <div className={cn("flex items-end gap-2 max-w-[75%]", 
                isCurrentUser ? "flex-row-reverse" : "flex-row"
              )}>
                {!isCurrentUser && showAvatar && (
                  <UserAvatar
                    user={message.sender}
                    className="h-6 w-6 mb-1"
                    size="sm"
                  />
                )}
                {!isCurrentUser && !showAvatar && (
                  <div className="w-6" /> // Placeholder для выравнивания
                )}
                <div
                  className={cn(
                    "px-3 py-2 rounded-2xl break-words",
                    isCurrentUser ? 
                      "bg-primary text-primary-foreground rounded-br-none" : 
                      "bg-muted rounded-bl-none",
                    "shadow-sm"
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className={cn(
                    "text-[10px] mt-1",
                    isCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground"
                  )}>
                    {format(new Date(message.createdAt), 'HH:mm')}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-card">
        <form onSubmit={sendMessage} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={
              friendshipStatus === 'ACCEPTED'
                ? "Введите сообщение..."
                : "Добавьте пользователя в друзья для отправки сообщений"
            }
            disabled={friendshipStatus !== 'ACCEPTED' || isLoading}
            className="bg-muted/50"
          />
          <Button 
            type="submit" 
            size="icon"
            disabled={friendshipStatus !== 'ACCEPTED' || !newMessage.trim() || isLoading}
            className="shrink-0"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  )
} 