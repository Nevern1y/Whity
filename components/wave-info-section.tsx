"use client"

import { motion } from "framer-motion"
import { Lightbulb, Brain, Target, Rocket } from "lucide-react"
import { cn } from "@/lib/utils"

const features = [
  {
    icon: Lightbulb,
    title: "Инновационный подход",
    description: "Современные методики обучения и передовые технологии в агропромышленности",
    gradient: "from-green-500 to-emerald-600",
    lightGradient: "from-green-100 to-emerald-200"
  },
  {
    icon: Brain,
    title: "Экспертные знания",
    description: "Курсы разработаны ведущими специалистами отрасли",
    gradient: "from-blue-500 to-indigo-600",
    lightGradient: "from-blue-100 to-indigo-200"
  },
  {
    icon: Target,
    title: "Практический опыт",
    description: "Реальные кейсы и практические задания для закрепления навыков",
    gradient: "from-purple-500 to-violet-600",
    lightGradient: "from-purple-100 to-violet-200"
  },
  {
    icon: Rocket,
    title: "Карьерный рост",
    description: "Развитие профессиональных компетенций и возможности для роста",
    gradient: "from-orange-500 to-red-600",
    lightGradient: "from-orange-100 to-red-200"
  }
]

export function WaveInfoSection() {
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Фон с градиентом */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/50 to-background dark:from-background dark:via-muted/10 dark:to-background" />
      
      {/* Декоративная сетка */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      <div className="container relative px-4">
        <motion.div 
          className="rounded-2xl overflow-hidden bg-gradient-to-br from-primary/5 via-primary/10 to-transparent dark:from-primary/10 dark:via-primary/5 dark:to-transparent"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {/* Волны */}
          <div className="absolute inset-0 opacity-20">
            <div className="wave dark:opacity-40" />
            <div className="wave dark:opacity-30" />
            <div className="wave dark:opacity-20" />
          </div>

          <div className="relative p-8 md:p-12">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group text-center"
                >
                  {/* Иконка */}
                  <div className={cn(
                    "inline-flex p-4 rounded-xl mb-4",
                    "bg-gradient-to-br dark:from-white/10 dark:to-white/5",
                    "from-primary/10 to-primary/5",
                    "backdrop-blur-sm",
                    "transition-all duration-300",
                    "group-hover:scale-110"
                  )}>
                    <feature.icon className={cn(
                      "w-6 h-6",
                      "transition-colors duration-300",
                      "text-primary dark:text-white"
                    )} />
                  </div>

                  {/* Текст */}
                  <h3 className={cn(
                    "text-xl font-semibold mb-2",
                    "bg-gradient-to-br",
                    feature.gradient,
                    "dark:text-white text-transparent bg-clip-text"
                  )}>
                    {feature.title}
                  </h3>

                  <p className={cn(
                    "text-sm leading-relaxed",
                    "text-gray-600 dark:text-gray-300"
                  )}>
                    {feature.description}
                  </p>

                  {/* Декоративный элемент */}
                  <div className={cn(
                    "absolute -z-10 top-0 left-0 w-full h-full opacity-0",
                    "group-hover:opacity-10 dark:group-hover:opacity-20",
                    "transition-opacity duration-300",
                    "bg-gradient-to-br",
                    feature.lightGradient,
                    "dark:bg-gradient-to-br",
                    feature.gradient
                  )} />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
} 