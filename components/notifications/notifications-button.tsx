"use client"

import { Bell, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNotifications } from "./notifications-context"
import { useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet"
import { NotificationsList } from "./notifications-list"
import { Badge } from "@/components/ui/badge"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

export function NotificationsButton() {
  const { unreadCount, markAllAsRead } = useNotifications()
  const [open, setOpen] = useState(false)
  const isMobile = useMediaQuery("(max-width: 768px)")

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn(
            "relative hover:bg-accent hover:text-accent-foreground",
            "focus-visible:ring-1 focus-visible:ring-ring",
            "transition-all duration-200 ease-in-out",
            "active:scale-95"
          )}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key="bell"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Bell className="h-5 w-5" />
            </motion.div>
          </AnimatePresence>
          
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute -top-1 -right-1"
              >
                <Badge 
                  variant="destructive" 
                  className={cn(
                    "h-5 w-5 rounded-full p-0",
                    "flex items-center justify-center",
                    "shadow-md",
                    "animate-pulse"
                  )}
                >
                  <span className="text-[10px] font-semibold">{unreadCount}</span>
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </SheetTrigger>
      
      <SheetContent 
        side={isMobile ? "bottom" : "right"}
        className={cn(
          isMobile 
            ? "h-[90vh] rounded-t-[var(--radius)] p-0"
            : "w-[400px]",
          "bg-gradient-to-b from-background to-muted/30",
          "backdrop-blur-[var(--blur-sm)]",
          "transition-transform duration-300 ease-in-out",
          "[&_button[aria-label='Close']]:hidden"
        )}
      >
        <SheetHeader className={cn(
          "px-4 py-3 border-b sticky top-0 z-10",
          "bg-background/95 backdrop-blur-[var(--blur-sm)]",
          "shadow-sm",
          isMobile && "mb-2"
        )}>
          <div className="flex items-center justify-between">
            <SheetTitle className={cn(
              "gradient-text font-semibold",
              isMobile && "text-lg"
            )}>
              Уведомления
            </SheetTitle>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size={isMobile ? "sm" : "default"}
                className={cn(
                  "text-muted-foreground hover:text-primary",
                  "transition-colors duration-200",
                  isMobile && "text-sm py-1 h-8"
                )}
                onClick={() => {
                  markAllAsRead()
                }}
              >
                Прочитать все
              </Button>
            )}
          </div>
        </SheetHeader>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={cn(
            "overflow-y-auto px-4",
            isMobile ? "h-[calc(90vh-4rem)]" : "h-[calc(100vh-4rem)]",
            "scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent"
          )}
        >
          <NotificationsList />
        </motion.div>
      </SheetContent>
    </Sheet>
  )
}