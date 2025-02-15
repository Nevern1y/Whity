"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Bell, ChevronLeft, Check } from "lucide-react"
import { useNotifications } from "./notifications/notifications-context"
import { Badge } from "@/components/ui/badge"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"
import { AnimatePresence } from "framer-motion"
import { useAnimation } from "@/components/providers/animation-provider"
import { popIn, scaleInOut, transitions } from "@/lib/framer-animations"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { NotificationsList } from "@/components/notifications/notifications-list"

export function NotificationsButton() {
  const { unreadCount, markAllAsRead } = useNotifications()
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [isOpen, setIsOpen] = useState(false)
  const { m, isReady } = useAnimation()

  if (!isReady || !m) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(true)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -right-1 -top-1 h-5 w-5 p-0 rounded-full flex items-center justify-center text-xs"
          >
            {unreadCount}
          </Badge>
        )}
      </Button>
    )
  }

  const MotionDiv = m.div

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
        >
          <Bell className="h-5 w-5" />
          <AnimatePresence mode="wait">
            {unreadCount > 0 && (
              <MotionDiv
                {...popIn}
                className="absolute -right-1 -top-1"
              >
                <Badge 
                  variant="destructive" 
                  className="h-5 w-5 p-0 rounded-full flex items-center justify-center text-xs"
                >
                  {unreadCount}
                </Badge>
              </MotionDiv>
            )}
          </AnimatePresence>
        </Button>
      </SheetTrigger>
      <SheetContent 
        side={isMobile ? "bottom" : "right"}
        className={cn(
          "w-full sm:max-w-lg p-0",
          isMobile && "h-[90vh] mt-auto rounded-t-[10px]"
        )}
      >
        <SheetHeader className="px-4 py-3 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle>Уведомления</SheetTitle>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="h-8 text-xs"
              >
                <Check className="h-4 w-4 mr-1" />
                Прочитать все
              </Button>
            )}
          </div>
        </SheetHeader>
        <ScrollArea className="h-full">
          <NotificationsList />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
} 