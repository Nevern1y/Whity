"use client"

import { useState } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useUserStats } from "@/hooks/use-user-stats"
import { NotificationsList } from "@/components/notifications/notifications-list"

export function NotificationsPopover() {
  const [open, setOpen] = useState(false)
  const { stats } = useUserStats()
  const unreadCount = stats?.unreadNotifications || 0

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
          <span className="sr-only">Уведомления</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b px-4 py-2">
          <h4 className="font-semibold">Уведомления</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              className="h-auto px-2 py-1 text-xs"
              onClick={() => {
                // TODO: Mark all as read
              }}
            >
              Отметить все как прочитанные
            </Button>
          )}
        </div>
        <ScrollArea className="h-[calc(80vh-10rem)] p-4">
          <NotificationsList />
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
} 