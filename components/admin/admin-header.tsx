"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { Bell, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UserNav } from "@/components/user-nav"
import { ThemeToggle } from "@/components/theme-toggle"

export function AdminHeader() {
  const { data: session } = useSession()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/admin" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">
              Панель управления
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/admin/courses"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Курсы
            </Link>
            <Link
              href="/admin/users"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Пользователи
            </Link>
            <Link
              href="/admin/analytics"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Статистика
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск..."
                className="pl-8 md:w-[300px] lg:w-[400px]"
              />
            </div>
          </div>
          <nav className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              aria-label="Уведомления"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-red-600 text-[10px] font-medium text-white">
                2
              </span>
            </Button>
            <ThemeToggle />
            {session?.user && <UserNav user={session.user} />}
          </nav>
        </div>
      </div>
    </header>
  )
} 