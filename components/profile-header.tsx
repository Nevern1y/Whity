"use client"

import { UserAvatar } from "@/components/user-avatar"
import { useSession } from "next-auth/react"

export function ProfileHeader() {
  const { data: session } = useSession()

  return (
    <div className="flex items-center gap-4">
      <UserAvatar 
        src={session?.user?.image || null} 
        size={64} 
        className="border-2 border-background" 
      />
      <div>
        <h2 className="text-2xl font-bold">{session?.user?.name}</h2>
        <p className="text-muted-foreground">{session?.user?.email}</p>
      </div>
    </div>
  )
} 