"use client"

import { Bell, ChevronLeft, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { NotificationsList } from "@/components/notifications-list"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { cn } from "@/lib/utils"

export function NotificationsButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(3)
  const isMobile = useMediaQuery("(max-width: 768px)")

  const handleMarkAllAsRead = () => {
    setUnreadCount(0)
    // Здесь добавить логику обновления на сервере
  }

  const NotificationTrigger = () => (
    <div className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10 relative">
      <AnimatePresence>
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -top-1 -right-1"
          >
            <Badge 
              variant="default" 
              className="h-5 w-5 rounded-full p-0 flex items-center justify-center"
            >
              {unreadCount}
            </Badge>
          </motion.div>
        )}
      </AnimatePresence>
      <Bell className="h-5 w-5" />
      <span className="sr-only">Уведомления</span>
    </div>
  )

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <NotificationTrigger />
      </SheetTrigger>

      <SheetContent 
        side={isMobile ? "bottom" : "right"}
        className={cn(
          "w-full sm:max-w-md p-0 flex flex-col",
          isMobile && "h-[90vh] rounded-t-[10px]"
        )}
      >
        <SheetHeader className="p-4 border-b shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isMobile && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setIsOpen(false)}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              )}
              <SheetTitle>Уведомления</SheetTitle>
            </div>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-xs"
                onClick={handleMarkAllAsRead}
              >
                <Check className="h-4 w-4" />
                <span>Прочитать все</span>
              </Button>
            )}
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <NotificationsList />
          </motion.div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
} 