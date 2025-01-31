"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Users, Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Progress } from "@/components/ui/progress"
import { Level } from "@prisma/client"

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
  progress = 0
}: MobileCourseCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
    >
      <Link href={`/courses/${id}`}>
        <Card className="overflow-hidden">
          <div className="relative aspect-[2/1]">
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <Badge 
              variant="secondary" 
              className="absolute top-2 right-2 backdrop-blur-md bg-background/80"
            >
              {level}
            </Badge>
          </div>

          <CardContent className="p-4">
            <h3 className="font-semibold line-clamp-2 mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              {description}
            </p>

            <div className="grid grid-cols-3 gap-2 text-sm text-muted-foreground mb-4">
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

            {progress > 0 && (
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Прогресс</span>
                  <span>{progress}%</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
} 