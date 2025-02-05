"use client"

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'

export function OnlineStatusHandler() {
  const { data: session } = useSession()

  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (session?.user?.id) {
        await fetch('/api/users/offline', { method: 'POST' })
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [session?.user?.id])

  return null
} 