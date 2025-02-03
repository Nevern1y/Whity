"use client"

import { CourseProgress } from "@/components/course-progress"

interface CourseProgressWrapperProps {
  userId: string
  data: {
    id: string
    title: string
    courseProgress: Array<{
      progress: number
      totalTimeSpent: number
      lastAccessedAt: Date
    }>
  }[]
}

interface FormattedCourse {
  id: string
  title: string
  progress: Array<{
    completed: number
    totalTimeSpent: number
    updatedAt: Date
  }>
}

export default function CourseProgressWrapper({ data }: CourseProgressWrapperProps) {
  const courses = data.map((course): FormattedCourse => ({
    id: course.id,
    title: course.title,
    progress: course.courseProgress.map((p) => ({
      completed: p.progress,
      totalTimeSpent: p.totalTimeSpent,
      updatedAt: p.lastAccessedAt
    }))
  }))

  return <CourseProgress courses={courses} />
} 