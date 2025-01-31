"use client"

import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { motion } from "framer-motion"
import { 
  Home, 
  BookOpen, 
  MessageSquare, 
  User, 
  Settings, 
  LogOut,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"

const navItems = [
  { href: "/", label: "Главная", icon: Home },
  { href: "/courses", label: "Курсы", icon: BookOpen },
  { href: "/messages", label: "Чаты", icon: MessageSquare },
  { href: "/profile", label: "Профиль", icon: User },
]

interface MobileSidebarProps {
  onClose?: () => void
}

export function MobileSidebar({ onClose }: MobileSidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          {session?.user && (
            <Avatar className="h-10 w-10">
              <AvatarImage src={session.user.image || undefined} />
              <AvatarFallback>{session.user.name?.[0]}</AvatarFallback>
            </Avatar>
          )}
          <div className="flex flex-col">
            <span className="font-semibold">
              {session?.user?.name || 'Гость'}
            </span>
            <span className="text-sm text-muted-foreground">
              {session?.user?.email || 'Войдите в аккаунт'}
            </span>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      <ScrollArea className="flex-1 px-2 py-4">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <motion.div
                key={item.href}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-accent text-muted-foreground hover:text-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                  {item.href === "/messages" && (
                    <span className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium">
                      2
                    </span>
                  )}
                </Link>
              </motion.div>
            )
          })}
        </div>
      </ScrollArea>

      <div className="border-t p-4">
        <div className="space-y-1">
          <Link
            href="/settings"
            className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Settings className="h-5 w-5" />
            <span>Настройки</span>
          </Link>
          {session ? (
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-500/10 hover:text-red-500"
              onClick={() => {
                signOut()
                onClose?.()
              }}
            >
              <LogOut className="h-5 w-5" />
              <span>Выйти</span>
            </Button>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
            >
              <User className="h-5 w-5" />
              <span>Войти</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
} 