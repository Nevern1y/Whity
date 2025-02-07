"use client"

import { useState, useRef, useEffect } from "react"
import { Camera, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useSyncUserImage } from "@/hooks/use-sync-user-image"
import Image from "next/image"
import { UserAvatar } from "@/components/user-avatar"
import { useUserStore } from "@/lib/store/user-store"

interface AvatarUploadProps {
  initialImage?: string | null
  onImageChange?: (url: string | null) => void
}

export function AvatarUpload({ initialImage, onImageChange }: AvatarUploadProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const { updateUserImage } = useSyncUserImage()
  const [isUploading, setIsUploading] = useState(false)
  const [currentImage, setCurrentImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isHovered, setIsHovered] = useState(false)

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

  const handleDeletePhoto = async () => {
    try {
      const response = await fetch('/api/user/image', {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete photo')
      }

      useUserStore.setState({ userImage: null })
      setCurrentImage(null)
      if (onImageChange) onImageChange(null)
      toast.success('Фото профиля удалено')
    } catch (error) {
      console.error('Error deleting photo:', error)
      toast.error('Не удалось удалить фото')
    }
  }

  return (
    <div 
      className="flex flex-col items-center gap-4"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
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

      {initialImage && isHovered && (
        <Button
          variant="destructive"
          size="icon"
          className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
          onClick={handleDeletePhoto}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
} 