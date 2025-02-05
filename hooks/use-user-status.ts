"use client"

import { useState, useEffect } from 'react'
import { socketClient } from '@/lib/socket-client'

export function useUserStatus(userId: string) {
  const [isOnline, setIsOnline] = useState(false)

  useEffect(() => {
    const socket = socketClient.getSocket()
    if (!socket) return

    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/users/status?userId=${userId}`)
        const data = await res.json()
        setIsOnline(data.isOnline)
      } catch (error) {
        console.error('Failed to check status:', error)
      }
    }
    
    // Проверяем статус каждые 30 секунд
    checkStatus()
    const interval = setInterval(checkStatus, 30000)

    socket.on('user_status', (data) => {
      if (data.userId === userId) {
        setIsOnline(data.isOnline)
      }
    })

    socket.emit('get_user_status', userId)

    return () => {
      clearInterval(interval)
      socket.off('user_status')
    }
  }, [userId])

  return isOnline
} 