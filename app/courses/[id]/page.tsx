import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Clock, Users, Star } from "lucide-react"
import Image from "next/image"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { notFound } from "next/navigation"
import type { Course, Lesson } from "@/types/prisma"

type CourseWithRelations = Course & {
  author: { id: string; name: string }
  lessons: Lesson[]
  students: { id: string }[]
}

async function getDetailedCourse(id: string): Promise<CourseWithRelations> {
  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      author: true,
      lessons: {
        orderBy: {
          createdAt: 'asc'
        }
      },
      students: true
    }
  })

  if (!course) notFound()
  return course as CourseWithRelations
}

export default async function CoursePage({ params }: { params: { id: string } }) {
  const course = await getDetailedCourse(params.id)
  const session = await auth()

  const isEnrolled = session && course.author.id === session.user?.id

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardContent className="p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="relative aspect-video">
              <Image 
                src={course.image ? `/uploads/${course.image}` : "/images/placeholder-course.jpg"}
                alt={course.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="space-y-4">
              <h1 className="text-3xl font-bold">{course.title}</h1>
              <p className="text-muted-foreground">{course.description}</p>
              <div className="flex items-center space-x-4">
                <Badge
                  variant={
                    course.level === "ADVANCED"
                      ? "destructive"
                      : course.level === "INTERMEDIATE"
                        ? "default"
                        : "secondary"
                  }
                >
                  {course.level === "ADVANCED" 
                    ? "Продвинутый" 
                    : course.level === "INTERMEDIATE" 
                      ? "Средний" 
                      : "Начальный"}
                </Badge>
              </div>
              {isEnrolled ? (
                <div className="space-y-2">
                  <Progress value={33} />
                  <p>Прогресс: 33%</p>
                  <Button className="w-full">Продолжить обучение</Button>
                </div>
              ) : (
                <Button className="w-full">Записаться на курс</Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      <h2 className="text-2xl font-bold mt-10 mb-6">Содержание курса</h2>
      <div className="space-y-4">
        {course.lessons.map((lesson: Lesson, index: number) => (
          <Card key={lesson.id}>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold">
                Урок {index + 1}: {lesson.title}
              </h3>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

