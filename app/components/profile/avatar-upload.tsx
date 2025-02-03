import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { UserAvatar } from "@/components/user-avatar"

// Предположим, что компонент получает url изображения и функцию для обновления
export function AvatarUpload({ imageUrl, onUpload }: { imageUrl: string; onUpload: (url: string) => void }) {
  return (
    <div className="flex items-center space-x-4">
      <UserAvatar
        src={imageUrl}
        className="h-24 w-24"
        fallback="JD"
      />
      <Button onClick={() => onUpload("new_image_url")}>Сменить аватар</Button>
    </div>
  )
} 