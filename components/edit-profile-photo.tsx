"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Camera, Loader2 } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"
import { useRouter } from "next/navigation"

interface EditProfilePhotoProps {
  currentPhotoUrl?: string | null
}

export function EditProfilePhoto({ currentPhotoUrl }: EditProfilePhotoProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setIsLoading(true)
      const formData = new FormData()
      formData.append('file', file)

      // Загружаем файл на сервер
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!uploadResponse.ok) throw new Error('Failed to upload file')
      const { url } = await uploadResponse.json()

      // Обновляем фото профиля
      const updateResponse = await fetch('/api/profile/photo', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: url })
      })

      if (!updateResponse.ok) throw new Error('Failed to update profile')

      toast.success('Фото профиля обновлено')
      router.refresh()
    } catch (error) {
      toast.error('Не удалось обновить фото')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative">
      <div className="w-24 h-24 rounded-full overflow-hidden bg-muted">
        {currentPhotoUrl ? (
          <Image
            src={currentPhotoUrl}
            alt="Profile photo"
            width={96}
            height={96}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <Camera className="w-8 h-8 text-muted-foreground" />
          </div>
        )}
      </div>
      <label
        htmlFor="photo-upload"
        className="absolute bottom-0 right-0 cursor-pointer"
      >
        {isLoading ? (
          <Button
            size="icon"
            variant="secondary"
            className="rounded-full"
            disabled
          >
            <Loader2 className="w-4 h-4 animate-spin" />
          </Button>
        ) : (
          <Button
            size="icon"
            variant="secondary"
            className="rounded-full"
          >
            <Camera className="w-4 h-4" />
          </Button>
        )}
        <input
          id="photo-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePhotoChange}
          disabled={isLoading}
        />
      </label>
    </div>
  )
} 