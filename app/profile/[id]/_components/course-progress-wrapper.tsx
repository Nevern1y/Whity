import { prisma } from "@/lib/prisma"
import { CourseProgress } from "@/components/course-progress"

interface CourseProgressWrapperProps {
  userId: string
}

interface CourseWithProgress {
  id: string
  title: string
  courseProgress: Array<{
    progress: number
    totalTimeSpent: number
    lastAccessedAt: Date
  }>
}

interface FormattedCourse {
  id: string
  title: string
  progress: Array<{
    completed: number
    totalTimeSpent: number
    updatedAt: Date
  }>
}

export default async function CourseProgressWrapper({ userId }: CourseProgressWrapperProps) {
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
  }) as CourseWithProgress[]

  const courses = enrolledCourses.map((course: CourseWithProgress): FormattedCourse => ({
    id: course.id,
    title: course.title,
    progress: course.courseProgress.map((p) => ({
      completed: p.progress,
      totalTimeSpent: p.totalTimeSpent,
      updatedAt: p.lastAccessedAt
    }))
  }))

  return <CourseProgress courses={courses} />
} 