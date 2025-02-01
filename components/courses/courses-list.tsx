"use client"

import { useState, useEffect } from "react"
import { CourseCard } from "@/components/courses/course-card"
import { MobileCourseCard } from "./mobile-course-card"
import { Level } from "@/types/prisma"
import { toast } from "sonner"
import { useMediaQuery } from "@/hooks/use-media-query"

interface Course {
  id: string
  title: string
  description: string
  image: string
  level: Level
  duration: string
  author: {
    id: string
    name: string
    image: string
  }
  studentsCount: number
  rating: number
  _count: {
    students: number
  }
  progress?: number
}

interface CoursesListProps {
  initialCourses: Course[]
}

export function CoursesList({ initialCourses }: CoursesListProps) {
  const [courses, setCourses] = useState<Course[]>(initialCourses)
  const [loading, setLoading] = useState(true)
  const isMobile = useMediaQuery("(max-width: 768px)")

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/courses')
      if (!response.ok) throw new Error('Failed to fetch courses')
      const data = await response.json()
      setCourses(data)
    } catch (error) {
      toast.error("Не удалось загрузить курсы")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div 
            key={i} 
            className="h-[300px] animate-pulse rounded-lg bg-muted"
          />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {courses.map((course) => (
        isMobile ? (
          <MobileCourseCard key={course.id} {...course} />
        ) : (
          <CourseCard key={course.id} {...course} />
        )
      ))}
    </div>
  )
} 