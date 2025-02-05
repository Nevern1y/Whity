"use client"

import { useState, useRef, useEffect } from "react"
import { Camera } from "lucide-react"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useSyncUserImage } from "@/hooks/use-sync-user-image"
import Image from "next/image"
import { UserAvatar } from "@/components/user-avatar"

interface AvatarUploadProps {
  initialImage?: string | null
  onImageChange?: (url: string) => void
}

export function AvatarUpload({ initialImage, onImageChange }: AvatarUploadProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const { updateUserImage } = useSyncUserImage()
  const [isUploading, setIsUploading] = useState(false)
  const [currentImage, setCurrentImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (initialImage && !initialImage.startsWith('blob:') && !initialImage.startsWith('data:')) {
      setCurrentImage(initialImage)
    }
  }, [initialImage])

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/profile/avatar", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Ошибка при загрузке файла")
      }

      const imageUrl = data.url
      updateUserImage(imageUrl)
      setCurrentImage(imageUrl)
      
      if (onImageChange) onImageChange(imageUrl)

      router.refresh()
      toast.success("Фото профиля обновлено")
    } catch (error) {
      console.error("Upload error:", error)
      toast.error(error instanceof Error ? error.message : "Ошибка при загрузке фото")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group">
        <UserAvatar 
          user={{ 
            image: currentImage, 
            name: session?.user?.name 
          }}
          className="relative flex shrink-0 overflow-hidden rounded-full ring-2 ring-background/50 w-32 h-32 border-4 border-background shadow-xl"
          size="lg"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
          <Button 
            variant="ghost" 
            size="sm"
            className="text-white"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <span className="animate-pulse">Загрузка...</span>
            ) : (
              <Camera className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={isUploading}
      />
    </div>
  )
} 