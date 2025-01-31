"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Camera } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"
import { useRouter } from "next/navigation"

interface ProfilePhotoUploadProps {
  currentPhotoUrl?: string | null
}

export function ProfilePhotoUpload({ currentPhotoUrl }: ProfilePhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const router = useRouter()

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)

      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload/profile-photo", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to upload photo")
      }

      const data = await response.json()
      toast.success("Фото профиля обновлено")
      router.refresh()
    } catch (error) {
      toast.error("Не удалось загрузить фото")
    } finally {
      setIsUploading(false)
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
        <Button
          size="icon"
          variant="secondary"
          className="rounded-full"
          disabled={isUploading}
        >
          <Camera className="w-4 h-4" />
        </Button>
        <input
          id="photo-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
          disabled={isUploading}
        />
      </label>
    </div>
  )
} 