"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu, LayoutDashboard, Users, BookOpen, Shield, Settings } from "lucide-react"
import { AdminNav } from "@/components/admin/admin-nav"
import { AdminBreadcrumbs } from "@/components/admin/admin-breadcrumbs"

const adminNavItems = [
  {
    title: "Обзор",
    items: [
      {
        title: "Панель управления",
        href: "/admin",
        icon: LayoutDashboard,
        roles: ["ADMIN", "MANAGER"]
      }
    ]
  },
  {
    title: "Управление",
    items: [
      {
        title: "Пользователи",
        href: "/admin/users",
        icon: Users,
        roles: ["ADMIN"]
      },
      {
        title: "Курсы",
        href: "/admin/courses",
        icon: BookOpen,
        roles: ["ADMIN", "MANAGER"]
      }
    ]
  },
  {
    title: "Настройки",
    items: [
      {
        title: "Общие",
        href: "/admin/settings",
        icon: Settings,
        roles: ["ADMIN"]
      },
      {
        title: "Безопасность",
        href: "/admin/security",
        icon: Shield,
        roles: ["ADMIN"]
      }
    ]
  }
]

export default function AdminLayout({
  children
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  if (status === "loading") {
    return null
  }

  if (!session?.user || !["ADMIN", "MANAGER"].includes(session.user.role)) {
    redirect("/")
  }

  // Filter nav items based on user role
  const filteredNavItems = adminNavItems.map(section => ({
    ...section,
    items: section.items.filter(item => item.roles.includes(session.user.role))
  }))

  return (
    <div className="relative flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-muted/40 backdrop-blur-sm">
        <div className="flex h-14 items-center border-b px-4 lg:h-[4rem]">
          <span className="font-semibold">Панель управления</span>
        </div>
        <ScrollArea className="flex-1">
          <AdminNav items={filteredNavItems} />
        </ScrollArea>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex h-14 lg:h-[4rem] items-center gap-4 border-b bg-muted/40 backdrop-blur-sm px-4">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="flex h-14 items-center border-b px-4">
                <span className="font-semibold">Панель управления</span>
              </div>
              <ScrollArea className="flex-1">
                <AdminNav
                  items={filteredNavItems}
                  onSelect={() => setOpen(false)}
                />
              </ScrollArea>
            </SheetContent>
          </Sheet>

          <div className="flex-1">
            <AdminBreadcrumbs />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container max-w-6xl py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
} 