import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CourseCard } from "@/components/course-card"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import type { Course } from "@/types/prisma"

interface CourseWithProgress {
  id: string;
  title: string;
  description: string;
  level: string;
  duration: number;
  progress?: number;
}

interface CourseProgress {
  courseId: string
  totalTimeSpent: number
}

async function getUserCourses(email: string | null | undefined): Promise<CourseWithProgress[]> {
  if (!email) return []
  
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      authoredCourses: true,
      enrolledCourses: true,
      courseProgress: true
    }
  })

  if (!user) return []

  return user.authoredCourses.map((course: Course) => ({
    id: course.id,
    title: course.title,
    description: course.description,
    level: course.level,
    duration: Number(course.duration),
    progress: user.courseProgress?.find((p: CourseProgress) => p.courseId === course.id)?.totalTimeSpent || 0
  }))
}

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">Доступ запрещен</h1>
        <p>Пожалуйста, войдите в систему для доступа к панели управления.</p>
      </div>
    )
  }

  const courses = await getUserCourses(session.user?.email)

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Панель управления</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего курсов</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Завершено курсов</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Общий прогресс</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">60%</div>
            <Progress value={60} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Следующий дедлайн</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3 дня</div>
          </CardContent>
        </Card>
      </div>
      <h2 className="text-2xl font-bold mt-10 mb-6">Мои курсы</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <CourseCard 
            key={course.id}
            id={course.id}
            title={course.title}
            level={course.level}
            duration={course.duration}
            progress={Number(course.progress) || 0}
          />
        ))}
      </div>
    </div>
  )
}

