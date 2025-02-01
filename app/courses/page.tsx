import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Suspense } from "react"
import { LoadingSpinner } from "@/components/loading-spinner"
import { auth } from "@/lib/auth"
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

export const revalidate = 60 // revalidate this page every 60 seconds

type SearchParams = {
  search?: string
  level?: Level
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
        author: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        _count: {
          select: {
            students: true
          }
        }
      }
    })

    const mappedCourses = courses.map((course: Course) => ({
      ...course,
      image: course.image || '',
      author: {
        ...course.author,
        image: course.author.image || '',
        name: course.author.name || ''
      },
      level: course.level as Level,
      studentsCount: course._count.students,
      rating: 4.5
    }))

    return mappedCourses
  } catch (error) {
    console.error("Database Error:", error)
    // Вместо выброса ошибки возвращаем пустой массив
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
            <SheetTrigger>
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

          {isAdmin && (
            <Link href="/courses/create" legacyBehavior passHref>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden md:inline">Создать курс</span>
                <span className="md:hidden">Создать</span>
              </Button>
            </Link>
          )}
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Курсы пока не добавлены</p>
        </div>
      ) : (
        <CoursesList initialCourses={courses} />
      )}
    </div>
  )
}

