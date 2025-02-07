import { Book, Trophy, Star, MessageSquare } from "lucide-react"

export const notificationTypes = {
  course: {
    icon: Book,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  achievement: {
    icon: Trophy,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
  },
  rating: {
    icon: Star,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
  message: {
    icon: MessageSquare,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
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