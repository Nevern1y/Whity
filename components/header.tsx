"use client"

import { useSession } from "next-auth/react"
import { UserNav } from "@/components/user-nav"
import { NotificationsButton } from "@/components/notifications-button"
import { cn } from "@/lib/utils"

export function Header() {
  const { data: session } = useSession()

  return (
    <header className="sticky top-0 z-20 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-12 items-center justify-end gap-2">
        {session && (
          <>
            <NotificationsButton />
            <div className="h-6 w-[1px] bg-border/50" />
            <UserNav />
          </>
        )}
      </div>
    </header>
  )
}

