"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"

interface ProfileFormData {
  name: string
  email: string
  bio?: string
  image?: string
}

interface ProfileFormProps {
  user: {
    id: string
    name: string | null
    email: string | null
    image: string | null
    bio?: string | null
  }
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormData>({
    defaultValues: {
      name: user.name || "",
      email: user.email || "",
      bio: user.bio || "",
      image: user.image || ""
    }
  })

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setIsLoading(true)
      
      const response = await fetch("/api/user/update", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to update profile")
      }

      toast.success("Профиль обновлен")
      router.refresh()
    } catch (error) {
      console.error("Update error:", error)
      toast.error(error instanceof Error ? error.message : "Не удалось обновить профиль")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Имя</Label>
        <Input
          id="name"
          {...register("name", { required: true })}
          disabled={isLoading}
        />
        {errors.name && (
          <p className="text-sm text-red-500">Это поле обязательно</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          {...register("email", { required: true })}
          disabled={isLoading}
        />
        {errors.email && (
          <p className="text-sm text-red-500">Введите корректный email</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">О себе</Label>
        <Textarea
          id="bio"
          {...register("bio")}
          disabled={isLoading}
        />
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Сохранение..." : "Сохранить изменения"}
      </Button>
    </form>
  )
} 