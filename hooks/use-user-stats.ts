"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useSocket } from "./use-socket"

interface UserStats {
  coursesCompleted: number
  achievements: number
  friends: number
  unreadNotifications: number
}

export function useUserStats() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<UserStats>({
    coursesCompleted: 0,
    achievements: 0,
    friends: 0,
    unreadNotifications: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const socket = useSocket()

  useEffect(() => {
    if (!session?.user?.id) return

    async function fetchStats() {
      try {
        const [statsResponse, notificationsResponse] = await Promise.all([
          fetch('/api/user/stats'),
          fetch('/api/notifications/unread/count')
        ])

        if (!statsResponse.ok || !notificationsResponse.ok) {
          throw new Error('Failed to fetch user stats')
        }

        const statsData = await statsResponse.json()
        const { count: unreadCount } = await notificationsResponse.json()

        setStats({
          coursesCompleted: statsData.coursesCompleted || 0,
          achievements: statsData.achievements || 0,
          friends: statsData.friends || 0,
          unreadNotifications: unreadCount
        })
      } catch (error) {
        console.error('Error fetching user stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()

    // Listen for real-time updates
    if (socket) {
      socket.on('stats:update', (newStats: Partial<UserStats>) => {
        setStats(prev => ({ ...prev, ...newStats }))
      })

      socket.on('notification:new', () => {
        setStats(prev => ({
          ...prev,
          unreadNotifications: prev.unreadNotifications + 1
        }))
      })

      socket.on('notification:read', () => {
        setStats(prev => ({
          ...prev,
          unreadNotifications: Math.max(0, prev.unreadNotifications - 1)
        }))
      })

      socket.on('notifications:clear', () => {
        setStats(prev => ({ ...prev, unreadNotifications: 0 }))
      })

      socket.on('achievement:earned', () => {
        setStats(prev => ({
          ...prev,
          achievements: prev.achievements + 1
        }))
      })

      socket.on('course:completed', () => {
        setStats(prev => ({
          ...prev,
          coursesCompleted: prev.coursesCompleted + 1
        }))
      })

      socket.on('friend:added', () => {
        setStats(prev => ({
          ...prev,
          friends: prev.friends + 1
        }))
      })

      socket.on('friend:removed', () => {
        setStats(prev => ({
          ...prev,
          friends: Math.max(0, prev.friends - 1)
        }))
      })
    }

    return () => {
      if (socket) {
        socket.off('stats:update')
        socket.off('notification:new')
        socket.off('notification:read')
        socket.off('notifications:clear')
        socket.off('achievement:earned')
        socket.off('course:completed')
        socket.off('friend:added')
        socket.off('friend:removed')
      }
    }
  }, [session?.user?.id, socket])

  const markAllNotificationsAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST'
      })

      if (!response.ok) throw new Error('Failed to mark notifications as read')

      setStats(prev => ({ ...prev, unreadNotifications: 0 }))
    } catch (error) {
      console.error('Error marking notifications as read:', error)
    }
  }

  return {
    stats,
    isLoading,
    markAllNotificationsAsRead
  }
} 