"use client"

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'

export function StatusHandler() {
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user?.id) return

    const updateStatus = async () => {
      try {
        const response = await fetch('/api/users/update-status', {
          method: 'POST',
          credentials: 'include',
        })

        if (!response.ok) {
          throw new Error(await response.text())
        }
      } catch (error) {
        console.error('Failed to update status:', error)
      }
    }

    updateStatus()
    const interval = setInterval(updateStatus, 30000)

    const handleBeforeUnload = () => {
      fetch('/api/users/offline', {
        method: 'POST',
        credentials: 'include',
        keepalive: true
      })
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      clearInterval(interval)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [session?.user?.id, status])

  return null
} 