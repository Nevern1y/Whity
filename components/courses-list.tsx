"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Users, Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Level } from "@prisma/client"

interface Course {
  id: string
  title: string
  description: string
  image: string
  level: Level
  duration: string
  studentsCount: number
  rating: number
  progress: number
}

export function CoursesList() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses')
      if (!response.ok) throw new Error('Failed to fetch courses')
      const data = await response.json()
      setCourses(data)
    } catch (error) {
      console.error('Error fetching courses:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return null // или вернуть скелетон

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {courses.map((course) => (
        <Card 
          key={course.id}
          className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow"
        >
          <div className="relative aspect-video">
            <Image
              src={course.image}
              alt={course.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <Badge 
              className="absolute top-2 right-2" 
              variant={course.level === 'BEGINNER' ? 'default' : 'secondary'}
            >
              {course.level}
            </Badge>
          </div>
          
          <CardContent className="flex-1 p-4">
            <h3 className="text-lg font-semibold mb-2 line-clamp-2">
              {course.title}
            </h3>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {course.description}
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{course.duration}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{course.studentsCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>{course.rating}</span>
              </div>
            </div>
          </CardContent>

          <CardFooter className="p-4 pt-0">
            {course.progress > 0 && (
              <div className="w-full mb-3">
                <Progress value={course.progress} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1 text-right">
                  {course.progress}% завершено
                </p>
              </div>
            )}
            <Link 
              href={`/courses/${course.id}`}
              className={cn(
                "w-full",
                "inline-flex items-center justify-center rounded-md",
                "bg-primary text-primary-foreground hover:bg-primary/90",
                "h-10 px-4 py-2",
                "text-sm font-medium",
                "transition-colors"
              )}
            >
              {course.progress === 0 ? "Начать" : 
               course.progress === 100 ? "Повторить" : "Продолжить"}
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
} 