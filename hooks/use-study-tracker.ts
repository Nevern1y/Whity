import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"

export function useStudyTracker(courseId: string) {
  const { data: session } = useSession()
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [isTracking, setIsTracking] = useState(false)

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isTracking && startTime) {
      interval = setInterval(async () => {
        const now = new Date()
        const timeSpent = Math.floor((now.getTime() - startTime.getTime()) / 60000) // в минутах

        // Обновляем статистику каждые 5 минут
        if (timeSpent % 5 === 0) {
          await fetch("/api/statistics", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ timeSpent: 5 })
          })

          // Создаем запись о сессии обучения
          await fetch("/api/study-sessions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              courseId,
              duration: 5
            })
          })
        }
      }, 60000) // Проверяем каждую минуту
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isTracking, startTime, courseId])

  const startTracking = () => {
    setStartTime(new Date())
    setIsTracking(true)
  }

  const stopTracking = async () => {
    if (startTime) {
      const endTime = new Date()
      const timeSpent = Math.floor((endTime.getTime() - startTime.getTime()) / 60000)

      await fetch("/api/study-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          duration: timeSpent,
          endTime
        })
      })
    }

    setIsTracking(false)
    setStartTime(null)
  }

  return { startTracking, stopTracking, isTracking }
} 