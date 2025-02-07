"use client"

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'

export function StatusHandler() {
  const { data: session, status } = useSession()

  useEffect(() => {
    // Отправляем offline статус при размонтировании компонента
    return () => {
      if (session?.user?.id && status === 'authenticated') {
        console.log('[StatusHandler] Setting offline status before unmount')
        fetch('/api/users/offline', { 
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        }).then(() => {
          console.log('[StatusHandler] Successfully set offline status')
        }).catch(error => {
          console.error('[StatusHandler] Failed to set offline status:', error)
        })
      }
    }
  }, [session?.user?.id, status])

  // Обновление статуса в отдельном эффекте
  useEffect(() => {
    if (status !== 'authenticated' || !session?.user?.id) {
      return
    }

    const updateStatus = async () => {
      try {
        const res = await fetch('/api/users/update-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        
        if (!res.ok) {
          throw new Error('Failed to update status')
        }
      } catch (error) {
        console.error('[StatusHandler] Error:', error)
      }
    }

    const interval = setInterval(updateStatus, 60000)
    updateStatus()

    return () => clearInterval(interval)
  }, [session?.user?.id, status])

  return null
} 