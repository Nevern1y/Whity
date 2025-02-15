import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Suspense } from "react"
import { LoadingSpinner } from "@/components/loading-spinner"
import { auth } from "@/auth"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  Plus, 
  BookOpen, 
  GraduationCap,
  Filter,
  SlidersHorizontal 
} from "lucide-react"
import { CoursesSkeleton } from "@/components/skeletons/courses-skeleton"
import { CoursesList, CourseFilters } from "@/components/courses"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Level } from "@/types/prisma"
import type { Course } from "@/types/prisma"
import { CourseCard } from "@/components/courses/course-card"
import { CreateCourseButton } from "@/components/course/create-course-button"

export const revalidate = 60 // revalidate this page every 60 seconds

type SearchParams = {
  search?: string
  level?: Level
}

// Обновляем интерфейс для курса с сервера
interface CourseWithDetails {
  id: string
  title: string
  description: string
  image: string | null
  level: Level
  duration: string
  authorId: string
  author: {
    id: string
    name: string | null
    image: string | null
  }
  studentsCount: number
  rating: number
}

// Добавим интерфейс для данных из БД
interface CourseFromDB {
  id: string
  title: string
  description: string
  image: string | null
  level: string
  duration: string
  authorId: string
  author: {
    id: string
    name: string | null
    image: string | null
  }
  _count: {
    progress: number
    ratings: number
  }
}

async function getCourses() {
  try {
    const courses = await prisma.course.findMany({
      where: {
        published: true
      },
      select: {
        id: true,
        title: true,
        description: true,
        image: true,
        level: true,
        duration: true,
        authorId: true,
        author: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        _count: {
          select: {
            progress: true,
            ratings: true
          }
        }
      }
    })

    // Добавляем типизацию для параметра course
    const mappedCourses: CourseWithDetails[] = courses.map((course: CourseFromDB) => ({
      id: course.id,
      title: course.title,
      description: course.description,
      image: course.image,
      level: course.level as Level,
      duration: course.duration,
      authorId: course.authorId,
      author: {
        id: course.author.id,
        name: course.author.name,
        image: course.author.image
      },
      studentsCount: course._count.progress,
      rating: course._count.ratings > 0 ? 4.5 : 0 // TODO: Implement actual rating calculation
    }))

    return mappedCourses
  } catch (error) {
    console.error("Database Error:", error)
    return []
  }
}

export default async function CoursesPage() {
  const session = await auth()
  const isAdmin = session?.user?.role === "ADMIN"
  const courses = await getCourses()

  return (
    <div className="container py-6 md:py-8">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="text-xl font-bold md:text-2xl">Курсы</h1>
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button 
                variant="outline" 
                size="icon"
                className="md:hidden"
              >
                <Filter className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-lg p-0">
              <SheetHeader className="px-4 py-3 border-b">
                <SheetTitle>Фильтры</SheetTitle>
              </SheetHeader>
              <div className="p-4">
                <CourseFilters className="space-y-4" />
              </div>
            </SheetContent>
          </Sheet>
          
          <div className="hidden md:flex gap-2">
            <CourseFilters />
          </div>

          {isAdmin && <CreateCourseButton />}
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Курсы пока не добавлены</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course: CourseWithDetails) => (
            <CourseCard
              key={course.id}
              course={{
                id: course.id,
                title: course.title,
                description: course.description,
                image: course.image || undefined,
                level: course.level,
                duration: course.duration,
                studentsCount: course.studentsCount,
                rating: course.rating
              }}
              currentUser={session?.user ? {
                id: session.user.id,
                role: session.user.role
              } : undefined}
            />
          ))}
        </div>
      )}
    </div>
  )
}

