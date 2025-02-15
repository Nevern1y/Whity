"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAnimation } from "@/components/providers/animation-provider"
import { cn } from "@/lib/utils"
import { Home, Settings, MessageSquare } from "lucide-react"
import { AnimatePresence } from "framer-motion"

const navItems = [
  {
    href: "/",
    icon: Home,
    label: "Главная"
  },
  {
    href: "/messages",
    icon: MessageSquare,
    label: "Сообщения"
  },
  {
    href: "/settings",
    icon: Settings,
    label: "Настройки"
  }
]

const navVariants = {
  hidden: {
    y: "100%",
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: "easeInOut"
    }
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeInOut"
    }
  }
}

export function MobileNavBar() {
  const pathname = usePathname()
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const { m, isReady } = useAnimation()

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      setIsVisible(currentScrollY <= lastScrollY || currentScrollY < 10)
      setLastScrollY(currentScrollY)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollY])

  if (!isReady || !m) {
    return (
      <nav className={cn(
        "fixed left-0 right-0 bottom-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t safe-area-bottom",
        "flex items-center justify-around"
      )}>
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "relative h-14 w-14",
                  isActive && "text-primary"
                )}
              >
                <item.icon className="h-6 w-6" />
                <span className="sr-only">{item.label}</span>
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 h-1 w-8 -translate-x-1/2 rounded-t-full bg-primary" />
                )}
              </Button>
            </Link>
          )
        })}
      </nav>
    )
  }

  const MotionDiv = m.div
  const MotionNav = m.nav

  return (
    <AnimatePresence>
      <MotionDiv
        className={cn(
          "fixed left-0 right-0 bottom-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t safe-area-bottom",
          "transition-transform duration-300"
        )}
        variants={navVariants}
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
      >
        <MotionNav className="flex items-center justify-around">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "relative h-14 w-14",
                    isActive && "text-primary"
                  )}
                >
                  <item.icon className="h-6 w-6" />
                  <span className="sr-only">{item.label}</span>
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 h-1 w-8 -translate-x-1/2 rounded-t-full bg-primary" />
                  )}
                </Button>
              </Link>
            )
          })}
        </MotionNav>
      </MotionDiv>
    </AnimatePresence>
  )
} 