"use client"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Users, Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Progress } from "@/components/ui/progress"
import { Level } from "@prisma/client"
import { cn } from "@/lib/utils"

interface CourseCardProps {
  id: string
  title: string
  description: string
  image: string
  level: Level
  duration: string
  studentsCount: number
  rating: number
  progress?: number
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
  progress = 0
}: CourseCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="flex flex-col overflow-hidden">
        <div className="relative aspect-video">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <Badge 
            variant={level === 'BEGINNER' ? 'default' : 'secondary'}
            className="absolute top-2 right-2"
          >
            {level}
          </Badge>
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