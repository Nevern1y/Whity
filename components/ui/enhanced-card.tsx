"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card"

interface EnhancedCardProps {
  title: React.ReactNode
  description?: React.ReactNode
  icon?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function EnhancedCard({
  title,
  description,
  icon,
  children,
  className,
}: EnhancedCardProps) {
  return (
    <Card className={`
      relative overflow-hidden border-none shadow-lg
      bg-gradient-to-br from-card to-muted/50
      hover:shadow-xl transition-all duration-200
      ${className}
    `}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 hover:opacity-100 transition-opacity duration-200" />
      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2 text-xl font-semibold tracking-tight">
          {icon && (
            <motion.div
              whileHover={{ rotate: 15 }}
              transition={{ duration: 0.2 }}
              className="p-1 rounded-md bg-primary/10 text-primary"
            >
              {icon}
            </motion.div>
          )}
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="text-sm text-muted-foreground">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="relative">
        {children}
      </CardContent>
    </Card>
  )
} 