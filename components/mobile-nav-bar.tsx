"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Home, BookOpen, MessageSquare, Menu, Bell } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { MobileSidebar } from "./mobile-sidebar"
import { useState } from "react"
import { MobileNotifications } from "./mobile-notifications"

const navItems = [
  { 
    href: "/", 
    label: "Главная", 
    icon: Home,
    color: "text-blue-500"
  },
  { 
    href: "/courses", 
    label: "Курсы", 
    icon: BookOpen,
    color: "text-green-500"
  },
  { 
    href: "/messages", 
    label: "Чаты", 
    icon: MessageSquare, 
    badge: 2,
    color: "text-purple-500"
  },
]

export function MobileNavBar() {
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-lg md:hidden safe-bottom">
      <div className="container mx-auto">
        <div className="flex h-16 items-center justify-around px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex-1"
              >
                <div className="flex flex-col items-center">
                  <motion.div
                    className={cn(
                      "relative flex h-10 w-10 items-center justify-center rounded-xl",
                      isActive ? "bg-primary/10" : "hover:bg-accent"
                    )}
                    whileTap={{ scale: 0.95 }}
                  >
                    <item.icon className={cn(
                      "h-5 w-5 transition-colors",
                      isActive ? item.color : "text-muted-foreground"
                    )} />
                    {item.badge && (
                      <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                        {item.badge}
                      </span>
                    )}
                  </motion.div>
                  <span className={cn(
                    "mt-1 text-xs",
                    isActive ? "font-medium text-foreground" : "text-muted-foreground"
                  )}>
                    {item.label}
                  </span>
                </div>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -bottom-[1px] left-0 right-0 h-0.5 bg-primary"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            )
          })}

          <div className="flex flex-1 justify-center space-x-2">
            <Sheet open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
              <SheetTrigger asChild>
                <button className="flex flex-col items-center">
                  <motion.div
                    className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-accent"
                    whileTap={{ scale: 0.95 }}
                  >
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                      3
                    </span>
                  </motion.div>
                  <span className="mt-1 text-xs text-muted-foreground">
                    Уведомления
                  </span>
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-md p-0">
                <MobileNotifications onClose={() => setIsNotificationsOpen(false)} />
              </SheetContent>
            </Sheet>

            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
              <SheetTrigger asChild>
                <button className="flex flex-col items-center">
                  <motion.div
                    className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-accent"
                    whileTap={{ scale: 0.95 }}
                  >
                    <Menu className="h-5 w-5 text-muted-foreground" />
                  </motion.div>
                  <span className="mt-1 text-xs text-muted-foreground">
                    Меню
                  </span>
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-md p-0">
                <MobileSidebar onClose={() => setIsSidebarOpen(false)} />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
} 