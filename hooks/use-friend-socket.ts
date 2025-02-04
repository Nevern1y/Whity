"use client"

import { useSocket } from "@/hooks/use-socket"
import { useEffect } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function useFriendSocket() {
  const socket = useSocket()
  const router = useRouter()

  useEffect(() => {
    if (!socket) return

    // Обработка входящей заявки в друзья
    socket.on('friend_request', (data) => {
      toast('Новая заявка в друзья', {
        action: {
          label: 'Посмотреть',
          onClick: () => {
            router.push('/friends')
            router.refresh()
          }
        }
      })
    })

    // Обработка ответа на заявку
    socket.on('friend_request_response', (data) => {
      const message = data.status === 'ACCEPTED' 
        ? 'Заявка в друзья принята'
        : 'Заявка в друзья отклонена'
      
      toast(message)
      router.push('/friends')
      router.refresh()
    })

    // Обработка отмены заявки
    socket.on('friend_request_cancelled', (data) => {
      toast('Заявка в друзья была отменена')
      router.push('/friends')
      router.refresh()
    })

    return () => {
      socket.off('friend_request')
      socket.off('friend_request_response')
      socket.off('friend_request_cancelled')
    }
  }, [socket, router])
} 