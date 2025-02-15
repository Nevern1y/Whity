import { Suspense } from "react"
import Link from "next/link"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { DataTable } from "@/components/admin/courses/data-table"
import { columns, type Course } from "@/components/admin/courses/columns"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export const metadata = {
  title: "Курсы",
  description: "Управление курсами платформы",
}

async function getCourses(): Promise<Course[]> {
  type CourseWithRelations = {
    id: string
    title: string
    description: string
    image: string | null
    published: boolean
    level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED"
    duration: string
    createdAt: Date
    updatedAt: Date
    authorId: string
    author: {
      id: string
      name: string | null
      email: string | null
    }
    _count: {
      ratings: number
      progress: number
    }
  }

  const courses = await prisma.course.findMany({
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          ratings: true,
          progress: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return courses.map((course: CourseWithRelations) => ({
    id: course.id,
    title: course.title,
    description: course.description,
    image: course.image,
    published: course.published,
    level: course.level,
    duration: course.duration,
    createdAt: course.createdAt,
    updatedAt: course.updatedAt,
    author: course.author,
    ratingsCount: course._count.ratings,
    studentsCount: course._count.progress,
    lessonsCount: 0, // TODO: Add lessons count when lessons are implemented
  }))
}

export default async function AdminCoursesPage() {
  const session = await auth()
  if (!session?.user?.id || !["ADMIN", "MANAGER"].includes(session.user.role)) {
    return null
  }

  const courses = await getCourses()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Курсы</h2>
          <p className="text-muted-foreground">
            Здесь вы можете управлять курсами платформы
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button asChild>
            <Link href="/admin/courses/new">
              <Plus className="mr-2 h-4 w-4" />
              Создать курс
            </Link>
          </Button>
        </div>
      </div>
      <Suspense fallback={<div>Загрузка...</div>}>
        <DataTable data={courses} columns={columns} />
      </Suspense>
    </div>
  )
} 