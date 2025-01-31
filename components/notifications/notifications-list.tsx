"use client"

import { useNotifications } from "@/hooks/use-notifications"
import { NotificationItem } from "./notification-item"
import { AnimatePresence } from "framer-motion"
import { NotificationSettings } from "./notification-settings"

export function NotificationsList() {
  const { groups, notifications, settings, markAsRead, dismissNotification } = useNotifications()

  const displayedNotifications = settings.showUnreadOnly 
    ? notifications.filter(n => !n.read)
    : notifications

  return (
    <div className="space-y-4">
      <NotificationSettings />
      <AnimatePresence>
        {settings.groupSimilar ? (
          groups.map(group => (
            <div key={group.id} className="space-y-2">
              {group.count > 1 && (
                <p className="text-sm text-muted-foreground">
                  {group.count} похожих уведомлений
                </p>
              )}
              {group.notifications.map(notification => (
                <NotificationItem
                  key={notification.id}
                  {...notification}
                  onRead={markAsRead}
                  onDismiss={dismissNotification}
                />
              ))}
            </div>
          ))
        ) : (
          displayedNotifications.map(notification => (
            <NotificationItem
              key={notification.id}
              {...notification}
              onRead={markAsRead}
              onDismiss={dismissNotification}
            />
          ))
        )}
      </AnimatePresence>
    </div>
  )
} 