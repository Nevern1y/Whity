"use client"

import { useMediaQuery } from "@/hooks/use-media-query"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

const footerLinks = [
  {
    title: "О нас",
    links: [
      { label: "О компании", href: "/about" },
      { label: "Контакты", href: "/contacts" },
      { label: "Карьера", href: "/careers" },
    ],
  },
  {
    title: "Обучение",
    links: [
      { label: "Все курсы", href: "/courses" },
      { label: "Преподаватели", href: "/teachers" },
      { label: "Расписание", href: "/schedule" },
    ],
  },
  {
    title: "Поддержка",
    links: [
      { label: "FAQ", href: "/faq" },
      { label: "Помощь", href: "/help" },
      { label: "Документация", href: "/docs" },
    ],
  },
]

const socialLinks = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
]

// Создаем новый компонент для социальных иконок
function SocialIcon({ icon: Icon, href, label }: typeof socialLinks[0]) {
  return (
    <Link 
      href={href} 
      aria-label={label}
      className="text-muted-foreground hover:text-primary 
                transition-colors active:scale-95"
    >
      <Icon className="h-5 w-5" />
    </Link>
  )
}

export function Footer() {
  const isMobile = useMediaQuery("(max-width: 768px)")

  return (
    <footer className="w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Desktop Version */}
      <div className="hidden md:block container px-4 py-12">
        <div className="hidden md:grid md:grid-cols-4 gap-8 pb-8">
          <div className="space-y-4">
            <Logo />
            <p className="text-sm text-muted-foreground">
              Образовательная платформа для специалистов агропромышленности
            </p>
          </div>
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h4 className="font-semibold mb-4">{group.title}</h4>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Version */}
      <div className="md:hidden px-6 py-8">
        {/* Лого и описание */}
        <div className="mb-8 text-center">
          <Logo className="text-xl mb-2" />
          <p className="text-xs text-muted-foreground">
            Образовательная платформа для специалистов агропромышленности
          </p>
        </div>

        {/* Ссылки в столбик */}
        <div className="space-y-6">
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h4 className="text-sm font-semibold mb-3">
                {group.title}
              </h4>
              <ul className="space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground/80 hover:text-primary
                               transition-colors flex items-center gap-2"
                    >
                      <div className="h-1 w-1 rounded-full bg-primary/50" />
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Социальные сети */}
        <div className="mt-8 pt-6 border-t">
          <div className="flex items-center justify-center gap-4">
            {socialLinks.map((social) => (
              <SocialIcon key={social.label} {...social} />
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 pt-6 border-t text-center">
          <p className="text-xs text-muted-foreground">
            © 2024 АЛЛЕЛЬ АГРО. Все права защищены.
          </p>
        </div>
      </div>
    </footer>
  )
}

