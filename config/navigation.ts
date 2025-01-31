import { Home, BookOpen, Newspaper, BookMarked, MessageSquare, Settings, Bell, User, School } from "lucide-react"

export const navigation = [
  {
    name: "Главное",
    items: [
      { name: "Главная", href: "/", icon: Home },
      { name: "Профиль", href: "/profile", icon: User },
      { name: "Уведомления", href: "/notifications", icon: Bell },
    ],
  },
  {
    name: "Обучение",
    items: [
      { name: "Курсы", href: "/courses", icon: BookOpen },
      { name: "База знаний", href: "/knowledge", icon: BookMarked },
      { name: "Достижения", href: "/achievements", icon: School },
    ],
  },
  {
    name: "Информация",
    items: [
      { name: "Новости", href: "/news", icon: Newspaper },
      { name: "Сообщения", href: "/messages", icon: MessageSquare },
    ],
  },
]

export type NavigationItem = {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

export type NavigationGroup = {
  name: string
  items: NavigationItem[]
} 