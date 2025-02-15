"use client"

import { useAnimation } from "@/components/providers/animation-provider"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface Course {
  id: string
  title: string
  description: string
  image?: string
  level: string
  duration: string
}

interface CoursesShowcaseProps {
  courses: Course[]
}

export function CoursesShowcase({ courses }: CoursesShowcaseProps) {
  const { m } = useAnimation()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course, index) => (
        <m.div
          key={course.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ y: -5 }}
        >
          <Card className={cn(
            "overflow-hidden h-full",
            "transition-colors duration-200",
            "hover:shadow-lg hover:border-primary/20"
          )}>
            {course.image && (
              <div className="relative h-48 w-full">
                <img
                  src={course.image}
                  alt={course.title}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
            )}
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-2">{course.title}</h3>
              <p className="text-muted-foreground mb-4 line-clamp-2">
                {course.description}
              </p>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{course.level}</span>
                <span>{course.duration}</span>
              </div>
            </div>
          </Card>
        </m.div>
      ))}
    </div>
  )
} 