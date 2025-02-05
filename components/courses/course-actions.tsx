"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { 
  MoreVertical, 
  Pencil, 
  Trash 
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CourseForm } from "@/components/courses/course-form"

interface CourseActionsProps {
  courseId: string
  authorId: string
  currentUserId: string
  userRole: string
}

export function CourseActions({ 
  courseId, 
  authorId, 
  currentUserId,
  userRole
}: CourseActionsProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const isAuthorized = currentUserId === authorId || userRole === 'ADMIN'

  if (!isAuthorized) return null

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error("Failed to delete course")
      }

      toast.success("Курс успешно удален")
      router.refresh()
      router.push('/courses')
    } catch (error) {
      toast.error("Не удалось удалить курс")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="relative">
      <DropdownMenu>
        <DropdownMenuTrigger>
          <div 
            className="h-8 w-8 p-0 flex items-center justify-center rounded-md backdrop-blur-sm bg-white/10 hover:bg-white/20 border-0 cursor-pointer"
          >
            <MoreVertical className="h-4 w-4" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end"
          className="w-48 backdrop-blur-md bg-white/90 dark:bg-gray-900/90"
        >
          <DropdownMenuItem 
            className="gap-2 cursor-pointer"
            onClick={() => setIsEditing(true)}
          >
            <Pencil className="h-4 w-4" />
            Редактировать
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="text-destructive gap-2 cursor-pointer"
            disabled={isDeleting}
            onClick={handleDelete}
          >
            <Trash className="h-4 w-4" />
            Удалить
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Редактировать курс</DialogTitle>
            <DialogDescription>
              Внесите необходимые изменения в информацию о курсе
            </DialogDescription>
          </DialogHeader>
          <CourseForm 
            courseId={courseId}
            onSuccess={() => {
              setIsEditing(false)
              router.refresh()
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
} 