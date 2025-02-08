"use client"

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { socketClient } from '@/lib/socket-client'

export function OnlineStatusHandler() {
  const { data: session } = useSession()

  useEffect(() => {
    if (!session?.user?.id) return

    const socket = socketClient.getSocket()
    let isOnline = navigator.onLine

    const updateOnlineStatus = async (status: boolean) => {
      try {
        if (!status && navigator.sendBeacon) {
          // Use sendBeacon for offline status
          navigator.sendBeacon('/api/users/offline')
        } else {
          // Use regular fetch for online status
          await fetch('/api/users/update-status', {
            method: 'POST',
            credentials: 'include'
          })
        }
        socket.emit('user_status', { userId: session.user.id, isOnline: status })
      } catch (error) {
        console.error('Failed to update status:', error)
      }
    }

    const handleOnline = () => {
      isOnline = true
      updateOnlineStatus(true)
    }

    const handleOffline = () => {
      isOnline = false
      updateOnlineStatus(false)
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        handleOnline()
      } else {
        handleOffline()
      }
    }

    const handleBeforeUnload = () => {
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/users/offline')
      }
    }

    // Initial status update
    updateOnlineStatus(isOnline)

    // Event listeners
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', handleBeforeUnload)
    
    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      handleBeforeUnload()
    }
  }, [session?.user?.id])

  return null
} 