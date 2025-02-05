"use client"

import { cn } from "@/lib/utils"

interface UserOnlineStatusProps {
  isOnline: boolean
  showDot?: boolean
  className?: string
}

export function UserOnlineStatus({ isOnline, showDot = true, className }: UserOnlineStatusProps) {
  if (!showDot) {
    return (
      <span className={cn(
        "text-xs",
        isOnline ? "text-green-500" : "text-red-500",
        className
      )}>
        {isOnline ? "В сети" : "Не в сети"}
      </span>
    )
  }

  return (
    <div className="flex items-center gap-1.5">
      <span className={cn(
        "relative flex h-2 w-2",
        className
      )}>
        <span className={cn(
          "absolute inline-flex h-full w-full rounded-full",
          isOnline ? "bg-green-500" : "bg-red-500/50"
        )}/>
        {isOnline && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"/>
        )}
      </span>
      <span className={cn(
        "text-xs",
        isOnline ? "text-green-500" : "text-red-500"
      )}>
        {isOnline ? "В сети" : "Не в сети"}
      </span>
    </div>
  )
} 