"use client"

import { Lightbulb, Brain, Target, Rocket } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/use-media-query"

const features = [
  {
    icon: Lightbulb,
    title: "Инновационный подход",
    description: "Современные методики обучения и передовые технологии в агропромышленности"
  },
  {
    icon: Brain,
    title: "Экспертные знания",
    description: "Курсы разработаны ведущими специалистами отрасли"
  },
  {
    icon: Target,
    title: "Практический опыт",
    description: "Реальные кейсы и практические задания для закрепления навыков"
  },
  {
    icon: Rocket,
    title: "Карьерный рост",
    description: "Развитие профессиональных компетенций и возможности для роста"
  }
]

export function FeaturesGrid() {
  const isMobile = useMediaQuery("(max-width: 768px)")

  if (isMobile) return null

  return (
    <div className="hidden md:grid grid-cols-4 gap-8 max-w-7xl mx-auto px-4">
      {features.map((feature, index) => (
        <motion.div
          key={feature.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="group relative"
        >
          <div className={cn(
            "relative h-[320px] rounded-3xl p-6",
            "bg-gradient-to-b from-primary/10 to-transparent",
            "border border-primary/20",
            "backdrop-blur-sm",
            "transition-all duration-500",
            "hover:translate-y-[-8px] hover:shadow-2xl hover:shadow-primary/20",
            "before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-t before:from-primary/5 before:to-primary/0",
            "after:absolute after:inset-0 after:rounded-3xl after:bg-gradient-to-br after:from-transparent after:to-primary/5",
            "overflow-hidden"
          )}>
            {/* Декоративный фоновый паттерн */}
            <div className="absolute inset-0 opacity-30 bg-grid-pattern" />
            
            {/* Светящийся круг за иконкой */}
            <div className="absolute top-12 left-1/2 -translate-x-1/2 w-24 h-24 
                          bg-primary/20 rounded-full blur-2xl 
                          group-hover:scale-150 transition-transform duration-700" />

            <div className="relative z-10 flex flex-col items-center text-center h-full">
              {/* Иконка с эффектами */}
              <div className="mb-6 p-4 rounded-2xl 
                            bg-gradient-to-br from-primary/30 to-primary/5
                            backdrop-blur-md
                            ring-1 ring-primary/20 ring-offset-2 ring-offset-background
                            transform transition-all duration-500
                            group-hover:scale-110 group-hover:rotate-[5deg]
                            group-hover:shadow-lg group-hover:shadow-primary/30">
                <feature.icon className="h-8 w-8 text-primary 
                                      transform transition-transform duration-700
                                      group-hover:rotate-[360deg]" />
              </div>

              {/* Заголовок с эффектом при наведении */}
              <h3 className="text-xl font-semibold text-primary mb-4
                           transform transition-all duration-500
                           group-hover:scale-105">
                {feature.title}
              </h3>

              {/* Описание с эффектом появления */}
              <p className="text-muted-foreground text-sm leading-relaxed
                          opacity-80 group-hover:opacity-100
                          transition-opacity duration-500">
                {feature.description}
              </p>

              {/* Декоративная линия */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-12 h-1 
                            bg-gradient-to-r from-transparent via-primary/30 to-transparent
                            rounded-full opacity-0 group-hover:opacity-100
                            transition-all duration-500
                            group-hover:w-24" />
            </div>

            {/* Интерактивный эффект свечения при наведении */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100
                          transition-opacity duration-700
                          bg-gradient-to-t from-primary/5 via-transparent to-transparent" />
          </div>
        </motion.div>
      ))}
    </div>
  )
} 