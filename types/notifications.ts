export interface Notification {
  id: string
  title: string
  message: string
  type: string
  read: boolean
  createdAt: Date
  userId: string
  groupId?: string
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