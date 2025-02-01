"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Book, Newspaper, MessageSquare } from "lucide-react"
import { useUserStore } from "@/lib/store/user-store"
import { useSession } from "next-auth/react"
import { useEffect } from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

const navigation = [
  { name: "Курсы", href: "/courses", icon: Book },
  { name: "База знаний", href: "/knowledge", icon: Newspaper },
  { name: "Сообщения", href: "/messages", icon: MessageSquare },
]

export function MainNav() {
  const pathname = usePathname()

  return (
    <nav className="absolute left-1/2 -translate-x-1/2">
      <div className="flex items-center space-x-1">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all",
                "hover:bg-accent hover:text-accent-foreground",
                "active:scale-95",
                isActive ? [
                  "bg-primary/10 text-primary font-medium",
                  "shadow-[inset_0_1px_0_0_rgba(148,163,184,0.1)]",
                  "hover:bg-primary/15 hover:text-primary"
                ] : "text-muted-foreground"
              )}
            >
              <Icon className={cn(
                "h-4 w-4 transition-transform",
                "group-hover:scale-110 group-hover:rotate-3"
              )} />
              <span className="hidden md:inline-block">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
} 