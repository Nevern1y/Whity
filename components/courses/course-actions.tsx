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
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {(currentUserId === authorId || userRole === 'ADMIN') && (
            <DropdownMenuItem onSelect={() => setIsEditing(true)}>
              <Pencil className="h-4 w-4 mr-2" />
              Редактировать
            </DropdownMenuItem>
          )}
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

      {isEditing && (
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Редактировать курс</DialogTitle>
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
      )}
    </div>
  )
} 