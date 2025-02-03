"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface UserAvatarProps {
  src?: string | null
  name?: string | null
  className?: string
  fallback?: string
  size?: "sm" | "md" | "lg"
}

export function UserAvatar({ 
  src, 
  name, 
  className,
  fallback,
  size = "md" 
}: UserAvatarProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-20 w-20"
  }

  return (
    <Avatar className={cn(
      "relative",
      sizeClasses[size],
      className
    )}>
      {src && (
        <AvatarImage 
          src={src} 
          alt={name || 'User avatar'} 
          className="aspect-square object-cover"
        />
      )}
      <AvatarFallback className="text-base font-semibold">
        {fallback || name?.[0]?.toUpperCase() || 'U'}
      </AvatarFallback>
    </Avatar>
  )
} 