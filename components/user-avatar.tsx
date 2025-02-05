"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import React from "react"

interface UserAvatarProps {
  user?: {
    image?: string | null
    name?: string | null
  }
  className?: string
  size?: "sm" | "md" | "lg"
}

export function UserAvatar({ user, ...props }: UserAvatarProps) {
  const [imageExists, setImageExists] = React.useState<boolean | null>(null)
  const fallbackImage = '/images/default-avatar.png'

  React.useEffect(() => {
    setImageExists(null)
    
    if (!user?.image) {
      setImageExists(false)
      return
    }

    if (user.image.startsWith('/uploads/')) {
      const filename = user.image.split('/').pop()
      if (!filename) {
        setImageExists(false)
        return
      }

      const cacheKey = `image-exists-${filename}`
      const cached = sessionStorage.getItem(cacheKey)
      
      if (cached !== null) {
        setImageExists(cached === 'true')
        return
      }

      fetch(`/api/uploads/check?file=${filename}`)
        .then(res => res.json())
        .then(data => {
          const exists = !!data.exists
          setImageExists(exists)
          sessionStorage.setItem(cacheKey, exists.toString())
        })
        .catch(() => {
          setImageExists(false)
          sessionStorage.setItem(cacheKey, 'false')
        })
    } else {
      setImageExists(true)
    }
  }, [user?.image])

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-20 w-20"
  }

  const imageSrc = React.useMemo(() => {
    if (imageExists === null) return user?.image || fallbackImage
    if (!imageExists) return fallbackImage
    return user?.image || fallbackImage
  }, [imageExists, user?.image])

  return (
    <Avatar className={cn(
      sizeClasses[props.size || "md"],
      props.className
    )}>
      <AvatarImage 
        src={imageSrc}
        alt={user?.name || 'User'} 
      />
    </Avatar>
  )
} 