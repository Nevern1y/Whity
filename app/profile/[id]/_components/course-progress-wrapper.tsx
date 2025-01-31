import { prisma } from "@/lib/prisma"
import { CourseProgress as ProgressComponent } from "@/components/course-progress"
import { Course, CourseProgress } from "@prisma/client"

interface CourseWithProgress {
  id: string
  title: string
  progress: Array<{
    completed: number
    totalTimeSpent: number
    updatedAt: Date
  }>
}

export default async function CourseProgressWrapper({ userId }: { userId: string }) {
  const enrolledCourses = await prisma.course.findMany({
    where: {
      courseProgress: {
        some: {
          userId
        }
      }
    },
    include: {
      courseProgress: {
        where: { userId }
      }
    }
  })

  const courses: CourseWithProgress[] = enrolledCourses.map((course: Course & { courseProgress: CourseProgress[] }) => ({
    id: course.id,
    title: course.title,
    progress: course.courseProgress.map((p: CourseProgress) => ({
      completed: p.progress,
      totalTimeSpent: p.totalTimeSpent,
      updatedAt: p.lastAccessedAt
    }))
  }))

  return <ProgressComponent courses={courses} />
} 