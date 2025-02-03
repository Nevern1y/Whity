"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
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
  fallbackImage = "/images/default_avatar.png",
  showFallback = false
}: UserAvatarProps) {
  const [error, setError] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  
  useEffect(() => {
    // Обработка URL изображения
    if (src) {
      if (!src.startsWith('http') && !src.startsWith('data:') && !src.startsWith('blob:')) {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
        setImageUrl(`${baseUrl}${src}`)
      } else {
        setImageUrl(src)
      }
    } else {
      setImageUrl(fallbackImage)
    }
  }, [src, fallbackImage])

  return (
    <div 
      className={cn(
        "relative aspect-square rounded-full overflow-hidden bg-muted",
        "ring-2 ring-background shadow-md",
        className
      )}
      style={{ width: size, height: size }}
    >
      {imageUrl && !error ? (
        <Image
          src={imageUrl}
          alt="Avatar"
          fill
          sizes={`${size}px`}
          className="object-cover"
          onError={() => setError(true)}
          priority
          unoptimized={false}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <User className="h-1/2 w-1/2 text-muted-foreground" />
        </div>
      )}
    </div>
  )
} 