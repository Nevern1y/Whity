"use client"

import { Bell, Search, LogOut, Book, Newspaper, User, MessageSquare, Home, Settings } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter, usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { NotificationsButton } from "@/components/notifications-button"
import { MobileSidebar } from "@/components/mobile-sidebar"

export function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const { data: session } = useSession()

  const navigation = [
    {
      icon: Home,
      label: "Главная",
      href: "/",
    },
    {
      icon: Book,
      label: "Курсы",
      href: "/courses",
    },
    {
      icon: Newspaper,
      label: "Статьи",
      href: "/articles",
    },
    {
      icon: MessageSquare,
      label: "Сообщения",
      href: "/messages",
    },
    {
      icon: Book,
      label: "База знаний",
      href: "/knowledge",
    },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        {/* Мобильное меню - показываем только на мобильных устройствах */}
        <div className="md:hidden">
          <MobileSidebar />
        </div>
        
        {/* Логотип */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-bold text-xl">АЛЛЕЛЬ АГРО</span>
        </Link>

        {/* Основная навигация для ПК */}
        <nav className="hidden md:flex items-center space-x-4 lg:space-x-6 mx-6">
          {navigation.map((item) => (
            <Button
              key={item.href}
              variant="ghost"
              asChild
              className={pathname === item.href ? "bg-accent" : ""}
            >
              <Link href={item.href} className="flex items-center space-x-2">
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            </Button>
          ))}
        </nav>

        <div className="flex flex-1 items-center justify-end space-x-4">
          {/* Поиск */}
          <div className="hidden lg:flex items-center space-x-2">
            <Input
              type="search"
              placeholder="Поиск..."
              className="w-[200px] lg:w-[300px]"
            />
            <Button type="submit" size="icon" variant="ghost">
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {session ? (
            <>
              {/* Уведомления */}
              <NotificationsButton />

              {/* Профиль */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                      <AvatarFallback>{session.user?.name?.[0]}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Профиль</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Настройки</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600"
                    onClick={() => signOut()}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Выйти</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button asChild>
              <Link href="/login">Войти</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}

