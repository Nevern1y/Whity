"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { z } from "zod"
import { ProfileHeader } from "@/components/profile-header"

const formSchema = z.object({
  name: z.string().min(2, "Имя должно содержать минимум 2 символа"),
  email: z.string().email("Введите корректный email"),
  bio: z.string().max(500, "Биография не должна превышать 500 символов").optional(),
})

type FormData = z.infer<typeof formSchema>

export default function EditProfilePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    bio: "",
  })
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/user/update", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          bio: formData.bio,
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || "Failed to update profile")
      }

      toast.success("Профиль обновлен")
      router.refresh()
    } catch (error) {
      console.error("Update error:", error)
      toast.error("Не удалось обновить профиль")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="container py-10">
      <ProfileHeader />
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {/* Форма редактирования */}
      </form>
    </div>
  )
} 