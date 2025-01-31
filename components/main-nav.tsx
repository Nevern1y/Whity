"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"

export function MainNav() {
  const pathname = usePathname()

  return (
    <div className="mr-4 flex">
      <Link href="/" className="mr-6 flex items-center space-x-2">
        <span className="hidden font-bold sm:inline-block">АЛЛЕЛЬ АГРО</span>
      </Link>
      <nav className="flex items-center space-x-6 text-sm font-medium">
        <Link
          href="/courses"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname === "/courses" ? "text-foreground" : "text-foreground/60"
          )}
        >
          Курсы
        </Link>
        <Link
          href="/forum"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname === "/forum" ? "text-foreground" : "text-foreground/60"
          )}
        >
          Форум
        </Link>
        <Link
          href="/articles"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname === "/articles" ? "text-foreground" : "text-foreground/60"
          )}
        >
          База знаний
        </Link>
      </nav>
    </div>
  )
} 