"use client"

import { useAnimation } from "@/components/providers/animation-provider"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatsCardProps {
  icon: any
  title: string
  value: number
  unit?: string
  description: string
  trend?: number
  trendLabel?: string
}

export function StatsCard({ 
  icon: Icon, 
  title, 
  value, 
  unit = "", 
  description,
  trend,
  trendLabel
}: StatsCardProps) {
  const { m } = useAnimation()
  
  return (
    <m.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
    >
      <Card>
        <div className="p-6">
          <div className="flex items-center gap-4">
            <m.div 
              className="p-3 rounded-full bg-primary/10"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Icon className="w-6 h-6 text-primary" />
            </m.div>
            <div>
              <p className="text-sm text-muted-foreground">{title}</p>
              <div className="flex items-baseline gap-1">
                <m.p 
                  className="text-2xl font-bold"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {value}
                </m.p>
                {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
              </div>
              <p className="text-sm text-muted-foreground">{description}</p>
              {trend !== undefined && trendLabel && (
                <m.div 
                  className="mt-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <div className="h-1 bg-primary/10 rounded-full overflow-hidden">
                    <m.div 
                      className="h-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${trend * 100}%` }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{trendLabel}</p>
                </m.div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </m.div>
  )
} 