"use client"

import { useState, useEffect } from 'react'

export function useOnlineStatus(userId: string) {
  const [isOnline, setIsOnline] = useState(false)

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/users/status?userId=${userId}`)
        const data = await res.json()
        setIsOnline(data.isOnline)
      } catch (error) {
        console.error('Failed to check status:', error)
      }
    }

    checkStatus()
    const interval = setInterval(checkStatus, 60000) // Проверяем каждую минуту

    return () => clearInterval(interval)
  }, [userId])

  return isOnline
} 