"use client"

import { Home, BookOpen, Newspaper, BookMarked, MessageSquare, Settings, Menu, Bell, User, School, ChevronDown } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSession } from "next-auth/react"
import { useState } from "react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

const navigation = [
  {
    name: "Главное",
    items: [
      { name: "Главная", href: "/", icon: Home },
      { name: "Профиль", href: "/profile", icon: User },
      { name: "Уведомления", href: "/notifications", icon: Bell },
    ],
  },
  {
    name: "Обучение",
    items: [
      { name: "Курсы", href: "/courses", icon: BookOpen },
      { name: "База знаний", href: "/knowledge", icon: BookMarked },
      { name: "Достижения", href: "/achievements", icon: School },
    ],
  },
  {
    name: "Информация",
    items: [
      { name: "Новости", href: "/news", icon: Newspaper },
      { name: "Сообщения", href: "/messages", icon: MessageSquare },
    ],
  },
]

export function MobileNav() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [openGroups, setOpenGroups] = useState<string[]>([])

  const toggleGroup = (groupName: string) => {
    setOpenGroups(prev => 
      prev.includes(groupName) 
        ? prev.filter(name => name !== groupName)
        : [...prev, groupName]
    )
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full max-w-[300px] p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle>
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={session?.user?.image || ''} />
                <AvatarFallback>{session?.user?.name?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{session?.user?.name}</span>
                <span className="text-xs text-muted-foreground">{session?.user?.email}</span>
              </div>
            </div>
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-4rem)]">
          <div className="flex-1 p-2">
            {navigation.map((group) => (
              <Collapsible
                key={group.name}
                open={openGroups.includes(group.name)}
                onOpenChange={() => toggleGroup(group.name)}
                className="mb-2"
              >
                <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent">
                  {group.name}
                  <ChevronDown className={cn(
                    "h-4 w-4 transition-transform",
                    openGroups.includes(group.name) && "transform rotate-180"
                  )} />
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1 pt-1">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-x-2 rounded-lg px-3 py-2 text-sm transition-colors",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.name}
                      </Link>
                    )
                  })}
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
          <div className="border-t p-2">
            <Link
              href="/settings"
              className="flex items-center gap-x-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <Settings className="h-4 w-4" />
              Настройки
            </Link>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
} 