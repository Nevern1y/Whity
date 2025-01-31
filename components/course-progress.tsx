import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'
import Link from "next/link"

interface CourseProgressProps {
  courses: Array<{
    id: string;
    title: string;
    progress: {
      completed: number;
      totalTimeSpent: number;
      updatedAt: Date;
    }[];
  }>;
}

export function CourseProgress({ courses }: CourseProgressProps) {
  if (!courses.length) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Нет активных курсов
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {courses.map(course => {
        const progress = course.progress[0]
        const progressPercent = progress ? progress.completed : 0

        return (
          <Card key={course.id}>
            <CardHeader className="pb-2">
              <Link href={`/courses/${course.id}`}>
                <CardTitle className="text-lg hover:text-primary transition-colors">
                  {course.title}
                </CardTitle>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Progress value={progressPercent} />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Прогресс: {progressPercent}%</span>
                  {progress?.updatedAt && (
                    <span>
                      Последняя активность: {formatDistanceToNow(progress.updatedAt, { 
                      addSuffix: true, locale: ru 
                    })}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
} 