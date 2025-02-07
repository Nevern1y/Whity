"use client"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Users, Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Progress } from "@/components/ui/progress"
import { Level } from "@/types/prisma"
import { cn } from "@/lib/utils"
import { CourseActions } from "@/components/courses/course-actions"
import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { DialogTrigger } from "@/components/ui/dialog"

interface CourseCardProps {
  id: string
  title: string
  description: string
  image: string | null
  level: Level
  duration: string
  studentsCount: number
  rating: number
  progress?: number
  authorId: string
  currentUser?: {
    id: string
    role: string
  }
}

export function CourseCard({
  id,
  title,
  description,
  image,
  level,
  duration,
  studentsCount,
  rating,
  progress = 0,
  authorId,
  currentUser
}: CourseCardProps) {
  console.log('Course data:', { id, title, image })
  
  const imageSrc = useMemo(() => {
    console.log('Raw image path:', image)
    if (!image) return "/images/placeholder-course.jpg"
    if (image.startsWith('/uploads/')) return image
    return `/uploads/${image}`
  }, [image])

  console.log('Final image src:', imageSrc)

  const showActions = currentUser && (currentUser.id === authorId || currentUser.role === 'ADMIN')

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="flex flex-col overflow-hidden group">
        <div className="relative aspect-video">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <Image
            src={imageSrc}
            alt={`Обложка курса: ${title}`}
            fill
            className="object-cover"
            priority={false}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={(e) => {
              console.error('Image load error:', e)
              const target = e.target as HTMLImageElement
              console.error('Failed to load:', target.src)
              target.src = "/images/placeholder-course.jpg"
            }}
          />

          <div className="absolute top-0 left-0 right-0 p-3 flex justify-between items-start">
            <Badge 
              variant={level === 'BEGINNER' ? 'default' : 'secondary'}
              className="backdrop-blur-sm bg-opacity-80"
            >
              {level}
            </Badge>

            {showActions && (
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <CourseActions
                  courseId={id}
                  authorId={authorId}
                  currentUserId={currentUser.id}
                  userRole={currentUser.role}
                />
              </div>
            )}
          </div>

          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />
        </div>

        <CardContent className="flex-1 p-4">
          <h3 className="text-lg font-semibold mb-2 line-clamp-2">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {description}
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{duration}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{studentsCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500" />
              <span>{rating.toFixed(1)}</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0">
          {progress > 0 && (
            <div className="w-full space-y-2 mb-4">
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Прогресс</span>
                <span>{progress}%</span>
              </div>
            </div>
          )}
          <Link 
            href={`/courses/${id}`}
            className={cn(
              "w-full",
              "inline-flex items-center justify-center rounded-md",
              "bg-primary text-primary-foreground hover:bg-primary/90",
              "h-10 px-4 py-2",
              "text-sm font-medium",
              "transition-colors"
            )}
          >
            {progress === 0 ? "Начать" : 
             progress === 100 ? "Повторить" : "Продолжить"}
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  )
} 