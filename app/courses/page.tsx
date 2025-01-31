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
import { Level } from "@prisma/client"
import { CoursesList, CourseFilters } from "@/components/courses"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export const revalidate = 60 // revalidate this page every 60 seconds

async function getCourses(searchParams: { search?: string; level?: Level }) {
  try {
    const { search, level } = searchParams
    const courses = await prisma.course.findMany({
      where: {
        ...(level && { level }),
        ...(search && {
          OR: [
            { title: { contains: search } },
            { description: { contains: search } }
          ]
        }),
      },
    })
    return courses
  } catch (error) {
    console.error("Failed to fetch courses:", error)
    return []
  }
}

export default async function CoursesPage() {
  const session = await auth()
  const isAdmin = session?.user?.role === "ADMIN"

  return (
    <div className="container py-6 md:py-8">
      {/* Мобильный заголовок */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="text-xl font-bold md:text-2xl">Курсы</h1>
        <div className="flex items-center gap-2">
          {/* Фильтры для мобильных */}
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
          
          {/* Фильтры для десктопа */}
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

      {/* Список курсов */}
      <div className="pb-16 md:pb-0"> {/* Отступ для нижней навигации на мобильных */}
        <Suspense fallback={<CoursesSkeleton />}>
          <CoursesList />
        </Suspense>
      </div>
    </div>
  )
}

