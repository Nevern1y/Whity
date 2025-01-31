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

export function WaveInfoSection() {
  return (
    <section className="py-20">
      <div className="container px-4">
        <motion.div 
          className="wave-section"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="wave" />
          <div className="wave" />
          <div className="wave" />
          <div className="content p-8 md:p-12">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="inline-flex p-3 rounded-full bg-white/10 mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-white/80 text-sm">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
} 