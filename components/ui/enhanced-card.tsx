"use client"

import { useAnimation } from "@/components/providers/animation-provider"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface EnhancedCardProps extends React.ComponentProps<typeof Card> {
  gradient?: string
  children: React.ReactNode
}

export function EnhancedCard({ 
  className, 
  children, 
  gradient = "from-primary/5 via-primary/2 to-transparent", 
  ...props 
}: EnhancedCardProps) {
  const { m } = useAnimation()
  const [isHovered, setIsHovered] = useState(false)

  return (
    <m.div
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={cn(
          "relative overflow-hidden",
          `bg-gradient-to-br ${gradient}`,
          "border-primary/10",
          "transition-all duration-300",
          className
        )}
        {...props}
      >
        {children}

        {/* Animated background */}
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 -z-10"
        >
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px]" />
          <div className="absolute inset-0 animate-wave opacity-20 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
          <div className="absolute inset-0 animate-wave-slow opacity-20 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
        </m.div>

        {/* Highlight effect */}
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 bg-gradient-to-tr from-transparent via-primary/2 to-primary/5 pointer-events-none"
        />
      </Card>
    </m.div>
  )
} 