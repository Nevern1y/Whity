export interface Notification {
  id: string
  type: "message" | "course" | "achievement" | "news" | "system"
  title: string
  message: string
  read: boolean
  createdAt: string
  data?: Record<string, any>
}

export interface NotificationEvents {
  "notification:new": (notification: Notification) => void
  "notification:updated": (notification: Pick<Notification, 'id' | 'read'>) => void
  "notification:read": (notificationId: string) => void
}

export interface NotificationSettings {
  groupSimilar: boolean
  showUnreadOnly: boolean
  soundEnabled: boolean
  desktopNotifications: boolean
}

export type SocketEventName = keyof NotificationEvents 