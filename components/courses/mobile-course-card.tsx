"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Users, Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"
import { Level } from "@prisma/client"
import { useAnimation } from "@/components/providers/animation-provider"
import { cn } from "@/lib/utils"

interface MobileCourseCardProps {
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

export function MobileCourseCard({
  id,
  title,
  description,
  image,
  level,
  duration,
  studentsCount,
  rating,
  progress
}: MobileCourseCardProps) {
  const { m, isReady } = useAnimation()

  const content = (
    <Card className="overflow-hidden">
      <div className="relative h-48">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <Badge
          variant="secondary"
          className="absolute top-2 right-2 backdrop-blur-md bg-background/80"
        >
          {level}
        </Badge>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{title}</h3>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {description}
        </p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{studentsCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span>{rating}</span>
          </div>
        </div>
        {progress !== undefined && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Прогресс</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} />
          </div>
        )}
      </CardContent>
    </Card>
  )

  if (!isReady || !m) {
    return (
      <Link href={`/courses/${id}`}>
        {content}
      </Link>
    )
  }

  const MotionDiv = m.div

  return (
    <Link href={`/courses/${id}`}>
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        transition={{ duration: 0.3 }}
      >
        {content}
      </MotionDiv>
    </Link>
  )
} 