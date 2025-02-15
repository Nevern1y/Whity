"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface AdminNavItem {
  title: string
  href: string
  icon: LucideIcon
  roles: string[]
}

interface AdminNavSection {
  title: string
  items: AdminNavItem[]
}

interface AdminNavProps {
  items: AdminNavSection[]
  onSelect?: () => void
}

export function AdminNav({ items, onSelect }: AdminNavProps) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col gap-6 p-4">
      {items.map((section, index) => (
        <div key={index} className="flex flex-col gap-2">
          <h4 className="text-xs font-semibold text-muted-foreground tracking-wider uppercase px-2">
            {section.title}
          </h4>
          {section.items.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onSelect}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm font-medium transition-colors",
                  "hover:bg-muted/80",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isActive && "bg-muted text-primary"
                )}
              >
                <Icon className={cn(
                  "h-4 w-4",
                  isActive ? "text-primary" : "text-muted-foreground"
                )} />
                <span className={cn(
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}>
                  {item.title}
                </span>
              </Link>
            )
          })}
        </div>
      ))}
    </div>
  )
} 