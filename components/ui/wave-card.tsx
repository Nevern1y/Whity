"use client"

import { useState } from "react"
import type { HTMLMotionProps } from "framer-motion"
import { useAnimation } from "@/components/providers/animation-provider"
import { cn } from "@/lib/utils"
import { hoverScale } from "@/lib/framer-animations"

interface WaveCardProps {
  children: React.ReactNode
  className?: string
  icon?: React.ReactNode
  title?: string
  subtitle?: string
}

export function WaveCard({ 
  children, 
  className,
  icon,
  title,
  subtitle
}: WaveCardProps) {
  const { m, isReady } = useAnimation()
  const [isHovered, setIsHovered] = useState(false)

  if (!isReady || !m) {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-xl",
          "bg-gradient-to-br from-primary/5 via-primary/2 to-transparent",
          "border border-primary/10",
          className
        )}
      >
        {children}
      </div>
    )
  }

  const MotionDiv = m.div

  return (
    <MotionDiv
      className={cn(
        "relative overflow-hidden rounded-xl",
        "bg-gradient-to-br from-primary/5 via-primary/2 to-transparent",
        "border border-primary/10",
        className
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={hoverScale}
    >
      {/* Animated background elements */}
      <MotionDiv
        className="absolute inset-0 -z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px]" />
        <div className="absolute inset-0 animate-wave opacity-20 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
        <div className="absolute inset-0 animate-wave-slow opacity-20 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
      </MotionDiv>

      {/* Content */}
      <MotionDiv
        className="relative z-10 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {icon && (
          <div className="mb-4">
            {icon}
          </div>
        )}
        {title && (
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
        )}
        {subtitle && (
          <p className="text-muted-foreground mb-4">{subtitle}</p>
        )}
        {children}
      </MotionDiv>

      {/* Highlight effect */}
      <MotionDiv
        className="absolute inset-0 bg-gradient-to-tr from-transparent via-primary/2 to-primary/5 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      />
    </MotionDiv>
  )
} 