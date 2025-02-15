"use client"

import { useState, useRef } from "react"
import { Camera, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useSyncUserImage } from "@/hooks/use-sync-user-image"
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
  const [isHovered, setIsHovered] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const userImage = useUserStore((state) => state.userImage)

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

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Ошибка при загрузке файла")
      }

      const data = await response.json()
      const imageUrl = data.url

      await updateUserImage(imageUrl)
      if (onImageChange) onImageChange(imageUrl)
      
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
      await updateUserImage(null)
      if (onImageChange) onImageChange(null)
      toast.success('Фото профиля удалено')
    } catch (error) {
      console.error('Error deleting photo:', error)
      toast.error('Не удалось удалить фото')
    }
  }

  const displayImage = userImage || initialImage || session?.user?.image

  return (
    <div 
      className="flex flex-col items-center gap-4"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-primary/50 rounded-full opacity-75 group-hover:opacity-100 blur transition duration-1000 group-hover:duration-200" />
        <UserAvatar 
          user={{ 
            image: displayImage, 
            name: session?.user?.name 
          }}
          className="relative flex shrink-0 overflow-hidden rounded-full ring-2 ring-background/50 w-32 h-32 border-4 border-background shadow-xl"
          size="lg"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
          <Button 
            variant="ghost" 
            size="sm"
            className="text-white hover:bg-white/20 transition-colors"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span className="text-sm">Загрузка...</span>
              </div>
            ) : (
              <>
                <Camera className="h-4 w-4 mr-2" />
                <span className="text-sm">Изменить</span>
              </>
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

      {displayImage && isHovered && (
        <Button
          variant="destructive"
          size="icon"
          className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={handleDeletePhoto}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
} 