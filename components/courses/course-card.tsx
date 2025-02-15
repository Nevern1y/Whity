"use client"

import { withAnimation } from "@/components/hoc/with-animation"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Clock, Star, Users } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import type { m } from "framer-motion"
import Image from "next/image"

interface CourseCardProps {
  course: {
    id: string
    title: string
    description: string
    image?: string
    level: string
    duration: string
    progress?: number
    rating?: number
    studentsCount?: number
  }
  currentUser?: {
    id: string
    role: string
  }
  className?: string
  m: typeof m | null
  isReady: boolean
}

function CourseCardContent({ course, className }: { 
  course: CourseCardProps["course"]
  className?: string 
}) {
  return (
    <Card className={cn(
      "overflow-hidden h-full transition-colors duration-200",
      "hover:shadow-lg hover:border-primary/20",
      className
    )}>
      {course.image && (
        <div className="relative h-48 w-full">
          <Image
            src={course.image}
            alt={course.title}
            fill
            className="object-cover"
          />
        </div>
      )}
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {course.description}
        </p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <Badge variant="secondary">{course.level}</Badge>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {course.duration}
          </div>
          {course.rating && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500" />
              {course.rating.toFixed(1)}
            </div>
          )}
          {course.studentsCount && (
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {course.studentsCount}
            </div>
          )}
        </div>
        {course.progress !== undefined && (
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Прогресс</span>
              <span>{Math.round(course.progress)}%</span>
            </div>
            <Progress value={course.progress} className="h-2" />
          </div>
        )}
      </div>
    </Card>
  )
}

function CourseCardBase({ course, currentUser, className, m, isReady }: CourseCardProps) {
  if (!isReady || !m) {
    return (
      <Link href={`/courses/${course.id}`}>
        <CourseCardContent course={course} className={className} />
      </Link>
    )
  }

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <Link href={`/courses/${course.id}`}>
        <CourseCardContent course={course} className={className} />
      </Link>
    </m.div>
  )
}

export const CourseCard = withAnimation(CourseCardBase) 