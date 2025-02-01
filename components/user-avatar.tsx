"use client"

import Image from "next/image"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { User } from "lucide-react"

interface UserAvatarProps {
  src: string | null
  className?: string
  size?: number
  fallbackImage?: string
  showFallback?: boolean
}

export function UserAvatar({ 
  src, 
  className, 
  size = 40,
  fallbackImage = "/images/default-avatar.png",
  showFallback = false
}: UserAvatarProps) {
  const [error, setError] = useState(false)
  
  // Проверяем и форматируем URL изображения
  const imageUrl = src && !src.startsWith('http') ? 
    `${process.env.NEXT_PUBLIC_APP_URL}${src}` : 
    src

  return (
    <div 
      className={cn(
        "relative aspect-square rounded-full overflow-hidden bg-muted",
        className
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src={imageUrl || fallbackImage}
        alt="Avatar"
        fill
        sizes={`${size}px`}
        className="object-cover"
        onError={() => setError(true)}
        priority
        unoptimized
      />
      {error && showFallback && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <User className="h-1/2 w-1/2 text-muted-foreground" />
        </div>
      )}
    </div>
  )
} 