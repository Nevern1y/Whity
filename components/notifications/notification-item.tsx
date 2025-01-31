"use client"

import { motion, AnimatePresence } from "framer-motion"
import { formatDistanceToNow } from "date-fns"
import { ru } from "date-fns/locale"
import { Bell, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface NotificationItemProps {
  id: string
  title: string
  message: string
  type: string
  createdAt: Date
  read: boolean
  onRead: (id: string) => void
  onDismiss: (id: string) => void
}

export function NotificationItem({
  id,
  title,
  message,
  type,
  createdAt,
  read,
  onRead,
  onDismiss
}: NotificationItemProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className={cn(
        "relative p-4 rounded-lg border",
        read ? "bg-background" : "bg-primary/5"
      )}
    >
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <Bell className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between gap-2">
            <p className="text-sm font-medium">{title}</p>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(createdAt), { 
                addSuffix: true,
                locale: ru 
              })}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {message}
          </p>
        </div>
      </div>
      <div className="absolute top-4 right-4 flex gap-1">
        {!read && (
          <button
            onClick={() => onRead(id)}
            className="p-1 hover:bg-accent rounded-full"
          >
            <Check className="h-4 w-4" />
          </button>
        )}
        <button
          onClick={() => onDismiss(id)}
          className="p-1 hover:bg-accent rounded-full"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  )
} 