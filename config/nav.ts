import type { LucideIcon } from "lucide-react"
import { 
  LayoutDashboard, Users, BookOpen, FileText, 
  Database, Activity, Shield, Settings, 
  MessageSquare, Bell, Trophy, BarChart2,
  FileCode, Newspaper, HelpCircle, Boxes,
  Wallet, Gift, Home
} from "lucide-react"

export interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

export const navItems: NavItem[] = [
  { href: "/", label: "Главная", icon: Home },
  { href: "/courses", label: "Курсы", icon: BookOpen },
  { href: "/messages", label: "Чаты", icon: MessageSquare },
  { href: "/profile", label: "Users", icon: Users },
]

export const adminNavItems = [
  {
    title: "Основное",
    items: [
      {
        title: "Обзор",
        href: "/admin",
        icon: LayoutDashboard,
        roles: ["ADMIN", "MANAGER"]
      },
      {
        title: "Статистика",
        href: "/admin/analytics",
        icon: BarChart2,
        roles: ["ADMIN", "MANAGER"]
      },
      {
        title: "Активность",
        href: "/admin/activity",
        icon: Activity,
        roles: ["ADMIN", "MANAGER"]
      }
    ]
  },
  {
    title: "Управление контентом",
    items: [
      {
        title: "Курсы",
        href: "/admin/courses",
        icon: BookOpen,
        roles: ["ADMIN", "MANAGER"]
      },
      {
        title: "Уроки",
        href: "/admin/lessons",
        icon: FileText,
        roles: ["ADMIN", "MANAGER"]
      },
      {
        title: "База знаний",
        href: "/admin/knowledge",
        icon: Newspaper,
        roles: ["ADMIN", "MANAGER"]
      },
      {
        title: "Достижения",
        href: "/admin/achievements",
        icon: Trophy,
        roles: ["ADMIN", "MANAGER"]
      }
    ]
  },
  {
    title: "Пользователи",
    items: [
      {
        title: "Пользователи",
        href: "/admin/users",
        icon: Users,
        roles: ["ADMIN"]
      },
      {
        title: "Роли",
        href: "/admin/roles",
        icon: Shield,
        roles: ["ADMIN"]
      },
      {
        title: "Сообщения",
        href: "/admin/messages",
        icon: MessageSquare,
        roles: ["ADMIN", "MANAGER"]
      },
      {
        title: "Уведомления",
        href: "/admin/notifications",
        icon: Bell,
        roles: ["ADMIN", "MANAGER"]
      }
    ]
  },
  {
    title: "Система",
    items: [
      {
        title: "База данных",
        href: "/admin/database",
        icon: Database,
        roles: ["ADMIN"]
      },
      {
        title: "API",
        href: "/admin/api",
        icon: FileCode,
        roles: ["ADMIN"]
      },
      {
        title: "Логи",
        href: "/admin/logs",
        icon: Boxes,
        roles: ["ADMIN"]
      }
    ]
  },
  {
    title: "Прочее",
    items: [
      {
        title: "Настройки",
        href: "/admin/settings",
        icon: Settings,
        roles: ["ADMIN"]
      },
      {
        title: "Поддержка",
        href: "/admin/support",
        icon: HelpCircle,
        roles: ["ADMIN", "MANAGER"]
      }
    ]
  }
] 