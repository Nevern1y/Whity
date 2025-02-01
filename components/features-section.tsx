"use client"

import { motion } from "framer-motion"
import { Lightbulb, Brain, Target, Rocket } from "lucide-react"

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

export function FeaturesSection() {
  return (
    <section className="container py-12 md:py-24 bg-card">
      <div className="grid gap-8 md:grid-cols-4">
        {features.map((feature, index) => {
          const Icon = feature.icon
          return (
            <motion.div
              key={feature.title}
              className="flex flex-col items-center text-center space-y-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
} 