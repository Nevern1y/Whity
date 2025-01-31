"use client"

import { useState } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { NotificationsList } from "@/components/notifications-list"

export function NotificationsButton() {
  const [unreadCount, setUnreadCount] = useState(3)

  return (
    <Sheet>
      <SheetTrigger>
        <Button 
          variant="ghost" 
          size="icon"
          className="relative"
          aria-label="Уведомления"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="secondary" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      {/* Мобильная версия уведомлений */}
      <SheetContent 
        side="right" 
        className="w-full p-0 sm:max-w-lg safe-top safe-bottom"
      >
        <div className="flex h-full flex-col">
          <SheetHeader className="px-4 py-3 border-b">
            <div className="flex items-center justify-between">
              <SheetTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <span>Уведомления</span>
                {unreadCount > 0 && (
                  <Badge variant="secondary">{unreadCount}</Badge>
                )}
              </SheetTitle>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setUnreadCount(0)}
                  disabled={unreadCount === 0}
                >
                  Прочитать все
                </Button>
              </div>
            </div>
          </SheetHeader>

          <ScrollArea className="flex-1">
            <div className="p-4">
              <NotificationsList />
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  )
} 