import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Users, Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface CourseCardProps {
  id: string
  title: string
  level: string
  duration: number
  progress?: number
}

export function CourseCard({
  id,
  title,
  level,
  duration,
  progress = 0,
}: CourseCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden h-full">
      <div className="relative aspect-video">
        <Image src={`/course-images/${id}.jpg`} alt={`Обложка курса: ${title}`} layout="fill" objectFit="cover" />
      </div>
      <CardContent className="flex-grow p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <Badge variant={level === "ADVANCED" ? "destructive" : level === "INTERMEDIATE" ? "default" : "secondary"}>
              {level === "ADVANCED" ? "Продвинутый" : level === "INTERMEDIATE" ? "Средний" : "Начальный"}
            </Badge>
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="mr-1 h-3 w-3" aria-hidden="true" />
              <span>{duration} ч.</span>
            </div>
          </div>
          <h3 className="font-semibold leading-tight">{title}</h3>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <div className="flex w-full flex-col gap-2">
          {progress > 0 && (
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Прогресс: {progress}%</div>
              <Progress value={progress} aria-label={`Прогресс курса: ${progress}%`} />
            </div>
          )}
          <Button className="w-full" asChild>
            <Link href={`/courses/${id}`}>
              {progress === 0 ? "Начать курс" : progress === 100 ? "Пройти заново" : "Продолжить"}
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

