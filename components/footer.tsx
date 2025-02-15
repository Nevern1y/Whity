"use client"

import { cn } from "@/lib/utils"
import { Logo } from "@/components/ui/logo"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useAnimation } from "@/components/providers/animation-provider"
import { m, AnimatePresence } from "framer-motion"

interface FooterProps {
  className?: string
}

const footerLinks = [
  {
    title: "Компания",
    links: [
      { label: "О нас", href: "/about" },
      { label: "Контакты", href: "/contacts" },
      { label: "Вакансии", href: "/careers" },
    ]
  },
  {
    title: "Обучение",
    links: [
      { label: "Все курсы", href: "/courses" },
      { label: "База знаний", href: "/knowledge" },
      { label: "Достижения", href: "/achievements" },
    ]
  },
  {
    title: "Поддержка",
    links: [
      { label: "Помощь", href: "/help" },
      { label: "FAQ", href: "/faq" },
      { label: "Обратная связь", href: "/feedback" },
    ]
  },
  {
    title: "Правовая информация",
    links: [
      { label: "Условия использования", href: "/terms" },
      { label: "Политика конфиденциальности", href: "/privacy" },
      { label: "Правила сообщества", href: "/community-guidelines" },
    ]
  }
]

export function Footer({ className }: FooterProps) {
  const isMobile = useMediaQuery("(max-width: 768px)")
  const { isReady } = useAnimation()

  const footerContent = (
    <div className="container px-4 py-8 md:py-12">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
        {footerLinks.map((section) => (
          <div key={section.title}>
            <h3 className="mb-3 text-sm font-medium">{section.title}</h3>
            <ul className="space-y-2">
              {section.links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Logo />
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} АЛЕЛЬ АГРО. Все права защищены.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <a 
            href="https://vk.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            VK
          </a>
          <a 
            href="https://t.me" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Telegram
          </a>
          <a 
            href="https://youtube.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            YouTube
          </a>
        </div>
      </div>
    </div>
  )

  const footerClassName = cn(
    "border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
    className
  )

  if (!isReady) {
    return (
      <footer className={footerClassName}>
        {footerContent}
      </footer>
    )
  }

  return (
    <AnimatePresence mode="sync">
      <m.footer
        key="footer"
        className={footerClassName}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {footerContent}
      </m.footer>
    </AnimatePresence>
  )
}

