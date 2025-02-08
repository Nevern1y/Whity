"use client"

import { useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { ClientOnly } from '@/components/client-only'

function sendSyncRequest(url: string, data: string) {
  if (navigator.sendBeacon) {
    return navigator.sendBeacon(url, data)
  }

  // Fallback to sync XHR if sendBeacon is not available
  try {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', url, false) // Synchronous request
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.send(data)
    return xhr.status >= 200 && xhr.status < 300
  } catch {
    return false
  }
}

function OnlineStatusContent() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const lastPingRef = useRef<number>(Date.now())
  const pingIntervalRef = useRef<NodeJS.Timeout>()

  // Skip on auth pages
  const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/register')
  const isAuthenticated = status === 'authenticated' && session?.user?.id

  useEffect(() => {
    if (isAuthPage || !isAuthenticated) return

    const updateOnlineStatus = async () => {
      try {
        lastPingRef.current = Date.now()
        await fetch('/api/users/update-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            isOnline: true,
            lastPing: lastPingRef.current
          }),
          keepalive: true
        })
      } catch (error) {
        console.error('Failed to update online status:', error)
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        const data = JSON.stringify({ 
          isOffline: true,
          lastPing: lastPingRef.current
        })
        sendSyncRequest('/api/users/offline', data)
      } else {
        updateOnlineStatus()
      }
    }

    const handleBeforeUnload = () => {
      const data = JSON.stringify({ 
        isOffline: true,
        lastPing: lastPingRef.current
      })
      sendSyncRequest('/api/users/offline', data)
    }

    // Set up periodic ping
    updateOnlineStatus()
    pingIntervalRef.current = setInterval(updateOnlineStatus, 30000)

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current)
      }
      handleBeforeUnload()
    }
  }, [isAuthPage, isAuthenticated])

  return null
}

export function OnlineStatusHandler() {
  return (
    <ClientOnly>
      <OnlineStatusContent />
    </ClientOnly>
  )
} 