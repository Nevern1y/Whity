"use client"

import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"

export function CreateCourseButton() {
  const { data: session } = useSession()
  const router = useRouter()
  
  if (session?.user?.role !== "ADMIN") return null

  return (
    <Button
      onClick={() => router.push("/courses/create")}
    >
      <Plus className="h-4 w-4 mr-2" />
      <span className="hidden md:inline">Создать курс</span>
      <span className="md:hidden">Создать</span>
    </Button>
  )
} 