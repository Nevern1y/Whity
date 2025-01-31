import { useState, useEffect } from 'react'

export function useCourseProgress(courseId: string) {
  const [progress, setProgress] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchProgress() {
      try {
        setLoading(true)
        const response = await fetch(`/api/courses/${courseId}/progress`)
        const data = await response.json()
        setProgress(data.progress)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setLoading(false)
      }
    }

    fetchProgress()
  }, [courseId])

  return { progress, loading, error }
} 