"use client"

import * as React from "react"
import { Bell } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { NotificationsList } from "../notifications-list"
import { useNotifications } from "./notifications-context"

const TriggerButton = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>((props, ref) => {
  const { unreadCount } = useNotifications()
  
  return (
    <div
      ref={ref}
      role="button"
      tabIndex={0}
      {...props}
      className={cn(
        "relative inline-flex items-center justify-center",
        "h-10 w-10 rounded-md",
        "bg-transparent hover:bg-accent",
        "text-sm font-medium",
        "transition-colors",
        "focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-ring focus-visible:ring-offset-2"
      )}
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
    </div>
  )
})
TriggerButton.displayName = "TriggerButton"

export function NotificationsButton() {
  const { unreadCount, markAllAsRead, loading } = useNotifications()

  return (
    <Sheet>
      <SheetTrigger asChild>
        <TriggerButton aria-label="Уведомления" />
      </SheetTrigger>
      
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
              <div
                role="button"
                tabIndex={0}
                onClick={markAllAsRead}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    markAllAsRead()
                  }
                }}
                className={cn(
                  "inline-flex items-center justify-center",
                  "rounded-md px-3 py-1 text-sm",
                  "bg-secondary hover:bg-secondary/80",
                  "transition-colors",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "focus-visible:outline-none focus-visible:ring-2",
                  "focus-visible:ring-ring focus-visible:ring-offset-2"
                )}
                aria-disabled={unreadCount === 0 || loading}
              >
                Прочитать все
              </div>
            </div>
          </SheetHeader>

          <ScrollArea className="flex-1">
            <div className="p-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : (
                <NotificationsList />
              )}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  )
}