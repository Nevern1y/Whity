import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import type { SessionInfo } from '@/types/session'

export function useSessions() {
  const { data: session } = useSession()
  const [sessions, setSessions] = useState<SessionInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.id) {
      fetchSessions()
    }
  }, [session])

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/settings/sessions')
      const data = await response.json()
      setSessions(data.sessions || [])
    } catch (error) {
      console.error('Failed to fetch sessions:', error)
      setSessions([])
    } finally {
      setIsLoading(false)
    }
  }

  const terminateSession = async (sessionId: string) => {
    try {
      await fetch('/api/settings/sessions', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      })
      await fetchSessions()
    } catch (error) {
      console.error('Failed to terminate session:', error)
    }
  }

  return {
    sessions,
    isLoading,
    terminateSession,
    refreshSessions: fetchSessions,
  }
} 