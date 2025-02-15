"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Book, Newspaper, MessageSquare } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { m } from "framer-motion"

const navigation = [
  { name: "Курсы", href: "/courses", icon: Book },
  { name: "База знаний", href: "/knowledge", icon: Newspaper },
  { name: "Сообщения", href: "/messages", icon: MessageSquare },
]

const containerVariants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  initial: { opacity: 0, x: -10 },
  animate: { opacity: 1, x: 0 },
  hover: { scale: 1.05 },
  tap: { scale: 0.95 }
}

export function MainNav() {
  const pathname = usePathname()
  const isMobile = useMediaQuery("(max-width: 768px)")
  
  return (
    <nav className="flex items-center">
      <m.div 
        className="flex items-center space-x-1"
        variants={containerVariants}
        initial="initial"
        animate="animate"
      >
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <m.div
              key={item.href}
              variants={itemVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all",
                  "hover:bg-accent hover:text-accent-foreground",
                  isActive ? [
                    "bg-primary/10 text-primary font-medium",
                    "shadow-[inset_0_1px_0_0_rgba(148,163,184,0.1)]",
                    "hover:bg-primary/15 hover:text-primary"
                  ] : "text-muted-foreground"
                )}
              >
                <Icon className={cn(
                  "h-4 w-4 transition-transform",
                  "group-hover:scale-110 group-hover:rotate-3"
                )} />
                {!isMobile && <span>{item.name}</span>}
              </Link>
            </m.div>
          )
        })}
      </m.div>
    </nav>
  )
} 