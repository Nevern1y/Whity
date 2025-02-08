import { Book, Trophy, Star, MessageSquare } from "lucide-react"

export const notificationTypes = {
  course: {
    icon: Book,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
  achievement: {
    icon: Trophy,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
  rating: {
    icon: Star,
    color: "text-orange-600",
    bgColor: "bg-orange-600/10",
  },
  message: {
    icon: MessageSquare,
    color: "text-amber-600",
    bgColor: "bg-amber-600/10",
  },
}

export const FRIENDSHIP_STATUS = {
  NONE: 'NONE',
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED'
} as const

export type FriendshipStatus = (typeof FRIENDSHIP_STATUS)[keyof typeof FRIENDSHIP_STATUS]
export type ExtendedFriendshipStatus = FriendshipStatus

export const FRIENDSHIP_STATUS_LABELS: Record<ExtendedFriendshipStatus, string> = {
  NONE: 'Добавить в друзья',
  PENDING: 'Заявка отправлена',
  ACCEPTED: 'В друзьях',
  REJECTED: 'Отклонено'
} as const 