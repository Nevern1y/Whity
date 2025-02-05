"use client"

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'

export function StatusHandler() {
  const { data: session } = useSession()

  useEffect(() => {
    if (!session?.user?.id) return

    const updateStatus = async () => {
      try {
        await fetch('/api/users/update-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        })
      } catch (error) {
        console.error('Failed to update status:', error)
      }
    }

    // Обновляем статус при загрузке и каждые 30 секунд
    updateStatus()
    const interval = setInterval(updateStatus, 30000)

    // Обработчик выхода
    const handleBeforeUnload = () => {
      fetch('/api/users/offline', {
        method: 'POST',
        keepalive: true // Важно для отправки запроса даже при закрытии страницы
      })
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      clearInterval(interval)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [session?.user?.id])

  return null
} 