"use client"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { BookOpen, Users, Award } from "lucide-react"
import { useAnimation } from "@/components/providers/animation-provider"

const cards = [
  {
    title: "Современные методики",
    description: "Актуальные знания от ведущих экспертов отрасли",
    icon: BookOpen,
  },
  {
    title: "Сообщество",
    description: "Общение с коллегами и обмен опытом",
    icon: Users,
  },
  {
    title: "Сертификация",
    description: "Официальные сертификаты о прохождении курсов",
    icon: Award,
  },
]

export function HomeCards() {
  const { m } = useAnimation()

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((card, index) => (
        <m.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ y: -5 }}
        >
          <Card className={cn(
            "p-6 h-full",
            "transition-colors duration-200",
            "hover:shadow-lg hover:border-primary/20"
          )}>
            <card.icon className="h-8 w-8 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
            <p className="text-muted-foreground">{card.description}</p>
          </Card>
        </m.div>
      ))}
    </div>
  )
} 