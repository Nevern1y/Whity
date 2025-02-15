"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils"

export function AdminBreadcrumbs() {
  const pathname = usePathname() || "/"
  const segments = pathname.split("/").filter(Boolean)

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-muted-foreground">
      <Link
        href="/admin"
        className={cn(
          "flex items-center gap-1 hover:text-foreground transition-colors",
          segments.length === 1 && segments[0] === "admin" && "text-foreground"
        )}
      >
        <Home className="h-4 w-4" />
        <span className="sr-only">Главная</span>
      </Link>

      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1
        const href = `/${segments.slice(0, index + 1).join("/")}`

        // Skip the first "admin" segment in the display
        if (index === 0 && segment === "admin") return null

        return (
          <span key={segment} className="flex items-center gap-1">
            <ChevronRight className="h-4 w-4" />
            {isLast ? (
              <span className="font-medium text-foreground capitalize">
                {formatSegment(segment)}
              </span>
            ) : (
              <Link
                href={href}
                className="hover:text-foreground transition-colors capitalize"
              >
                {formatSegment(segment)}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}

function formatSegment(segment: string) {
  const segmentMap: Record<string, string> = {
    users: "Пользователи",
    courses: "Курсы",
    settings: "Настройки",
    security: "Безопасность"
  }

  return segmentMap[segment] || segment
} 