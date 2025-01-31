"use client"

import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"

interface ProgressTrackerProps {
  courseId: string
  userId: string
}

export function ProgressTracker({ courseId, userId }: ProgressTrackerProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    async function fetchProgress() {
      const response = await fetch(`/api/progress/${courseId}/${userId}`)
      const data = await response.json()
      setProgress(data.progress)
    }
    fetchProgress()
  }, [courseId, userId])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ваш прогресс</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-muted-foreground text-center">
            {progress}% завершено
          </p>
        </div>
      </CardContent>
    </Card>
  )
} 