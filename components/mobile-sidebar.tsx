"use client"

import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Home, 
  BookOpen, 
  MessageSquare, 
  Settings, 
  LogOut,
  X,
  ChevronRight,
  Bell,
  Trophy,
  Newspaper,
  GraduationCap,
  Camera
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { navItems } from "@/config/nav"
import { motion, AnimatePresence } from "framer-motion"
import { slideInFromRight, listItem, staggerContainer, transitions } from "@/lib/framer-animations"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { NavItem } from "@/config/nav"
import { UserAvatar } from "@/components/user-avatar"
import { AvatarUpload } from "@/components/profile/avatar-upload"
import { useUserStore } from "@/lib/store/user-store"
import { useRouter } from "next/navigation"
import * as React from "react"

interface MobileSidebarProps {
  onClose: () => void
}

const quickActions = [
  { 
    icon: GraduationCap, 
    label: "Мои курсы",
    href: "/courses/my",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10"
  },
  { 
    icon: Trophy, 
    label: "Достижения",
    href: "/achievements",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10"
  },
  { 
    icon: Bell, 
    label: "Уведомления",
    href: "/notifications",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    badge: "3"
  },
  { 
    icon: Newspaper, 
    label: "Новости",
    href: "/news",
    color: "text-green-500",
    bgColor: "bg-green-500/10"
  }
]

export function MobileSidebar({ onClose }: MobileSidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const router = useRouter()
  const { userImage } = useUserStore()

  return (
    <motion.div
      variants={slideInFromRight}
      transition={transitions.slow}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex h-full flex-col bg-background"
    >
      {/* Header with User Info */}
      <div className="relative p-6 pb-4 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose}
          className="absolute right-4 top-4 hover:bg-background/80"
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-4 mt-4">
          {session?.user && (
            <UserAvatar
              user={{
                name: session.user.name,
                image: session.user.image
              }}
              size="lg"
              className="h-14 w-14 border-2 border-background shadow-lg"
            />
          )}
          <div className="flex flex-col">
            <span className="font-semibold text-lg leading-none mb-1">
              {session?.user?.name || 'Гость'}
            </span>
            <span className="text-sm text-muted-foreground">
              {session?.user?.email || 'Войдите в аккаунт'}
            </span>
            {session?.user && (
              <div className="flex items-center gap-1.5 mt-1">
                <Link 
                  href="/settings" 
                  className={cn(
                    "text-xs text-primary hover:underline",
                    "flex items-center gap-1.5"
                  )}
                  onClick={onClose}
                >
                  <Settings className="h-3 w-3" />
                  <span>Настройки профиля</span>
                </Link>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">
                  Изменить фото
                </span>
              </div>
            )}
          </div>
        </div>

        {session?.user && (
          <div className="grid grid-cols-3 gap-2 mt-6">
            <div className="flex flex-col items-center p-3 rounded-xl bg-background/80 backdrop-blur shadow-sm">
              <span className="font-semibold text-lg text-primary">12</span>
              <span className="text-xs text-muted-foreground mt-0.5">Курсов</span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-xl bg-background/80 backdrop-blur shadow-sm">
              <span className="font-semibold text-lg text-primary">5</span>
              <span className="text-xs text-muted-foreground mt-0.5">Достижений</span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-xl bg-background/80 backdrop-blur shadow-sm">
              <span className="font-semibold text-lg text-primary">28</span>
              <span className="text-xs text-muted-foreground mt-0.5">Друзей</span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions Grid */}
      <div className="p-4">
        <motion.div 
          className="grid grid-cols-2 gap-3"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {quickActions.map((action) => (
            <motion.div key={action.href} variants={listItem}>
              <Link
                href={action.href}
                onClick={onClose}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-xl transition-all",
                  "hover:scale-[1.02] hover:shadow-md",
                  action.bgColor,
                  pathname === action.href && "ring-2 ring-primary/20"
                )}
              >
                <div className="relative">
                  <action.icon className={cn("h-6 w-6", action.color)} />
                  {action.badge && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -right-2 -top-2 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
                    >
                      {action.badge}
                    </Badge>
                  )}
                </div>
                <span className="text-sm font-medium">{action.label}</span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Main Navigation */}
      <ScrollArea className="flex-1 px-4">
        <motion.div 
          className="space-y-1"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {navItems
            .filter(item => item.href !== "/profile") // Исключаем пункт профиля
            .map((item: NavItem) => {
              const isActive = pathname === item.href
              return (
                <motion.div
                  key={item.href}
                  variants={listItem}
                  transition={transitions.default}
                >
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all",
                      "hover:bg-accent hover:translate-x-1",
                      isActive 
                        ? "bg-primary/10 text-primary shadow-sm" 
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <item.icon className={cn(
                      "h-5 w-5 transition-transform",
                      isActive && "text-primary"
                    )} />
                    <span>{item.label}</span>
                    {item.href === "/messages" && (
                      <Badge variant="secondary" className="ml-auto">
                        2
                      </Badge>
                    )}
                    <ChevronRight className={cn(
                      "ml-auto h-4 w-4 text-muted-foreground/50",
                      isActive && "text-primary/50"
                    )} />
                  </Link>
                </motion.div>
              )
            })}
        </motion.div>
      </ScrollArea>

      {/* Footer Actions */}
      <div className="border-t bg-muted/50 p-4">
        <div className="space-y-2">
          <Link
            href="/settings"
            onClick={onClose}
            className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:bg-accent group"
          >
            <Settings className="h-4 w-4 group-hover:rotate-90 transition-transform" />
            <span>Настройки</span>
          </Link>
          {session ? (
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-500/10 hover:text-red-500 group"
              onClick={() => {
                signOut()
                onClose()
              }}
            >
              <LogOut className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              <span>Выйти</span>
            </Button>
          ) : (
            <Link
              href="/login"
              onClick={onClose}
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary/10 group"
            >
              <LogOut className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              <span>Войти</span>
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  )
} 