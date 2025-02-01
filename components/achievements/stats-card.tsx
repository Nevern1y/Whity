"use client"

import { motion } from "framer-motion"
import CountUp from "react-countup"
import { cn } from "@/lib/utils"

interface StatsCardProps {
  title: string
  value: number
  total?: number
  unit?: string
  icon: React.ReactNode
  delay?: number
}

export function StatsCard({ title, value, total, unit, icon, delay = 0 }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className={cn(
        "p-4 rounded-lg",
        "bg-gradient-to-br from-primary/5 to-primary/10",
        "border border-primary/10",
        "hover:shadow-lg hover:shadow-primary/5",
        "transition-all duration-300"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <div className="flex items-baseline gap-1">
            <CountUp
              end={value}
              duration={2}
              delay={delay}
              className="text-2xl font-bold"
            />
            {total && (
              <>
                <span className="text-muted-foreground">/</span>
                <span className="text-lg text-muted-foreground">{total}</span>
              </>
            )}
            {unit && <span className="text-sm text-muted-foreground ml-1">{unit}</span>}
          </div>
        </div>
        <div className="text-primary/60">{icon}</div>
      </div>
    </motion.div>
  )
} 