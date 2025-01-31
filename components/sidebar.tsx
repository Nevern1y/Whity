"use client"

import { Home, BookOpen, Newspaper, BookMarked, MessageSquare, Settings, Bell, ChevronDown, User, School } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
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

export function Sidebar() {
  const pathname = usePathname()
  const [openGroups, setOpenGroups] = useState<string[]>([])

  const toggleGroup = (groupName: string) => {
    setOpenGroups(prev => 
      prev.includes(groupName) 
        ? prev.filter(name => name !== groupName)
        : [...prev, groupName]
    )
  }

  return (
    <div className="w-full md:w-[250px] border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-full flex-col">
        <div className="flex-1 space-y-1 p-2">
          {navigation.map((group) => (
            <Collapsible
              key={group.name}
              open={openGroups.includes(group.name)}
              onOpenChange={() => toggleGroup(group.name)}
              className="space-y-1"
            >
              <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent">
                {group.name}
                <ChevronDown className={cn(
                  "h-4 w-4 transition-transform",
                  openGroups.includes(group.name) && "transform rotate-180"
                )} />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1">
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
      </div>
    </div>
  )
}

