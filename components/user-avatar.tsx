"use client"

import * as React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface UserAvatarProps {
  user: {
    name?: string | null
    image?: string | null
  }
  className?: string
  size?: "sm" | "md" | "lg" | "xl"
  fallback?: string
}

export function UserAvatar({ 
  user, 
  className, 
  size = "md", 
  fallback 
}: UserAvatarProps) {
  const userInitials = React.useMemo(() => {
    return fallback || user.name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase() || '?'
  }, [fallback, user.name])

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-20 w-20",
    xl: "h-32 w-32"
  }

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      <AvatarImage 
        src={user.image || undefined}
        alt={user.name || ""}
      />
      <AvatarFallback delayMs={100}>
        {userInitials}
      </AvatarFallback>
    </Avatar>
  )
} 