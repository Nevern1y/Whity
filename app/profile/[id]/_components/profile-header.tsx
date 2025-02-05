"use client"

import { Avatar, AvatarImage } from "@/components/ui/avatar"
// ... other imports

interface ProfileHeaderProps {
  user: {
    id: string
    name: string | null
    email: string | null
    image: string | null
  }
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-16 w-16">
        <AvatarImage src={user.image || ""} />
      </Avatar>
      <div>
        <h1 className="text-2xl font-bold">
          {user.name || user.email || "Пользователь"}
        </h1>
        {/* ... other content ... */}
      </div>
    </div>
  )
} 