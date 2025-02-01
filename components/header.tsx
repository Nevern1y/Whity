"use client"

import { Book, Newspaper, MessageSquare, Home, Menu, ArrowLeft, Trophy } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { NotificationsButton } from "@/components/notifications/notifications-button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { MainNav } from "@/components/main-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserNav } from "@/components/user-nav"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Logo } from "@/components/ui/logo"
import { useUserStore } from "@/lib/store/user-store"
import { useSyncUserImage } from "@/hooks/use-sync-user-image"

export function Header() {
  const pathname = usePathname()
  const { data: session, update } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isMobile = useMediaQuery("(max-width: 768px)")
  const isAuthPage = pathname?.startsWith('/auth')
  const setUserImage = useUserStore((state) => state.setUserImage)

  useSyncUserImage()

  useEffect(() => {
    if (session?.user?.image) {
      setUserImage(session.user.image)
    }
  }, [session?.user?.image, setUserImage])

  if (isAuthPage) return null

  const navigation = [
    { name: "Главная", href: "/", icon: Home },
    { name: "Курсы", href: "/courses", icon: Book },
    { name: "База знаний", href: "/knowledge", icon: Newspaper },
    { name: "Сообщения", href: "/messages", icon: MessageSquare },
    { name: "Достижения", href: "/achievements", icon: Trophy },
  ]

  return (
    <header className="sticky top-0 z-50 w-full header">
      <div className="container flex h-14 items-center">
        <div className="flex items-center gap-4">
          {isMobile && (
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="shrink-0">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Меню</span>
                </Button>
              </SheetTrigger>
              <SheetContent 
                side="left" 
                className={cn(
                  "w-[80vw] max-w-[400px] p-0",
                  "bg-gradient-to-b from-background to-muted/30"
                )}
                hideCloseButton
              >
                <div className="flex items-center justify-between border-b p-4 bg-background/95 backdrop-blur">
                  <Logo showText />
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setMobileMenuOpen(false)}
                    className="hover:bg-accent rounded-full"
                  >
                    <ArrowLeft className="h-5 w-5" />
                    <span className="sr-only">Закрыть меню</span>
                  </Button>
                </div>
                <nav className="flex flex-col py-2">
                  {navigation.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 text-sm transition-colors",
                          "hover:bg-accent/50",
                          isActive && "bg-accent text-accent-foreground font-medium"
                        )}
                      >
                        <Icon className={cn(
                          "h-5 w-5",
                          isActive ? "text-primary" : "text-muted-foreground"
                        )} />
                        {item.name}
                      </Link>
                    )
                  })}
                </nav>
              </SheetContent>
            </Sheet>
          )}

          {!isMobile && (
            <div className="shrink-0">
              <Logo showText={false} />
            </div>
          )}
        </div>

        {!isMobile && <MainNav />}

        <div className="flex items-center gap-1.5 ml-auto">
          {session?.user ? (
            <>
              <NotificationsButton />
              <ThemeToggle />
              <UserNav user={session.user} />
            </>
          ) : (
            <>
              <ThemeToggle />
              {!isMobile ? (
                <>
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/auth/login">Войти</Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link href="/auth/register">Регистрация</Link>
                  </Button>
                </>
              ) : (
                <Button asChild size="sm">
                  <Link href="/auth/login">Войти</Link>
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  )
}

