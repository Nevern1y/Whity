"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Home,
  GraduationCap,
  BookOpen,
  Users,
  MessageSquare,
  Bell,
  Settings,
  Shield,
  X
} from "lucide-react"
import { useSession } from "next-auth/react"
import Image from "next/image"
import { useState, useEffect, useRef, useCallback } from "react"

interface SidebarProps extends React.HTMLAttributes<HTMLElement> {}

export function Sidebar({ className, ...props }: SidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === "ADMIN"
  const isInstructor = session?.user?.role === "INSTRUCTOR"
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const sidebarRef = useRef<HTMLElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const updatePosition = useCallback(() => {
    const scrollY = window.scrollY
    if (sidebarRef.current) {
      sidebarRef.current.style.transform = `translateY(${scrollY}px)`
    }
    if (dropdownRef.current) {
      dropdownRef.current.style.transform = `translateY(${scrollY}px)`
    }
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', updatePosition, { passive: true })
    updatePosition()
    return () => window.removeEventListener('scroll', updatePosition)
  }, [updatePosition])

  // Обновляем позицию при открытии/закрытии меню
  useEffect(() => {
    updatePosition()
  }, [activeMenu, updatePosition])

  const navItems = [
    {
      id: "main",
      title: "Главное",
      icon: Home,
      tooltip: "Основные разделы",
      items: [
        {
          title: "Главная",
          href: "/dashboard"
        },
        {
          title: "Мои курсы",
          href: "/courses"
        },
        {
          title: "База знаний",
          href: "/knowledge"
        }
      ]
    },
    {
      id: "social",
      title: "Социальное",
      icon: Users,
      tooltip: "Общение и коммуникации",
      items: [
        {
          title: "Сообщества",
          href: "/communities"
        },
        {
          title: "Сообщения",
          href: "/messages"
        }
      ]
    },
    ...(isAdmin || isInstructor ? [{
      id: "admin",
      title: "Администрирование",
      icon: Shield,
      tooltip: "Управление платформой",
      items: [
        {
          title: "Управление курсами",
          href: "/admin/courses"
        },
        {
          title: "Управление пользователями",
          href: "/admin/users"
        },
        {
          title: "Управление ролями",
          href: "/admin/roles"
        }
      ]
    }] : [])
  ]

  return (
    <>
      <aside 
        ref={sidebarRef}
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-[52px] bg-[#2D2D2D]",
          "flex flex-col items-center py-4 gap-2",
          "will-change-transform",
          className
        )}
        {...props}
      >
        {/* Logo */}
        <Link 
          href="/" 
          className="group relative flex items-center justify-center w-10 h-10 mb-4"
        >
          <div className="relative w-8 h-8">
            <Image
              src="/logo.svg"
              alt="Logo"
              fill
              className="object-contain brightness-0 invert"
            />
          </div>
          <div className="absolute left-full ml-2 hidden rounded-md bg-zinc-900 px-2 py-1 text-xs text-zinc-100 whitespace-nowrap group-hover:block">
            На главную
          </div>
        </Link>

        {/* Navigation */}
        <ScrollArea className="flex-1 w-full">
          <nav className="flex flex-col items-center gap-1 px-1">
            {navItems.map((section) => {
              const Icon = section.icon
              const isActive = activeMenu === section.id
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveMenu(isActive ? null : section.id)}
                  className={cn(
                    "group relative flex h-10 w-10 items-center justify-center rounded-lg",
                    "transition-colors duration-200",
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  
                  {/* Enhanced Tooltip */}
                  {!isActive && (
                    <div className="absolute left-full ml-2 hidden rounded-md bg-zinc-900 px-2 py-1 text-xs text-zinc-100 whitespace-nowrap group-hover:block">
                      <div className="font-medium">{section.title}</div>
                      <div className="text-zinc-400">{section.tooltip}</div>
                    </div>
                  )}
                </button>
              )
            })}
          </nav>
        </ScrollArea>
      </aside>

      {/* Dropdown Menus */}
      {activeMenu && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-black/20"
            onClick={() => setActiveMenu(null)}
          />
          <div 
            ref={dropdownRef}
            className={cn(
              "fixed left-[52px] top-0 z-50 h-screen w-64 bg-white dark:bg-zinc-900 border-r",
              "will-change-transform"
            )}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-medium">
                {navItems.find(item => item.id === activeMenu)?.title}
              </h2>
              <button
                onClick={() => setActiveMenu(null)}
                className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <ScrollArea className="h-[calc(100vh-65px)]">
              <div className="p-2">
                {navItems
                  .find(item => item.id === activeMenu)
                  ?.items.map((item, index) => (
                    <Link
                      key={index}
                      href={item.href}
                      onClick={() => setActiveMenu(null)}
                      className={cn(
                        "flex items-center px-3 py-2 text-sm rounded-lg",
                        "transition-colors duration-200",
                        "hover:bg-zinc-100 dark:hover:bg-zinc-800",
                        pathname === item.href && "bg-primary/10 text-primary"
                      )}
                    >
                      {item.title}
                    </Link>
                  ))}
              </div>
            </ScrollArea>
          </div>
        </>
      )}
    </>
  )
}

