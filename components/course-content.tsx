"use client"

import { useStudyTracker } from "@/hooks/use-study-tracker"
import { useEffect } from "react"

export function CourseContent({ courseId }: { courseId: string }) {
  const { startTracking, stopTracking } = useStudyTracker(courseId)

  useEffect(() => {
    startTracking()
    return () => {
      stopTracking()
    }
  }, [])

  // ... остальной код компонента
} 