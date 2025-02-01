"use client"

import { motion } from "framer-motion"
import { Users, BookOpen, Award, Trophy } from "lucide-react"
import CountUp from 'react-countup'

const stats = [
  {
    value: 1000,
    label: "Студентов",
    icon: Users,
    suffix: "+",
  },
  {
    value: 50,
    label: "Курсов",
    icon: BookOpen,
    suffix: "+",
  },
  {
    value: 5000,
    label: "Выданных сертификатов",
    icon: Award,
    suffix: "+",
  },
  {
    value: 98,
    label: "Процент успешных выпускников",
    icon: Trophy,
    suffix: "%",
  },
]

export function StatsSection() {
  return (
    <section className="container py-8 md:py-12">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              className="flex flex-col items-center justify-center space-y-2 text-center p-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="flex h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-full bg-primary/10">
                <Icon className="h-6 w-6 md:h-8 md:w-8 text-primary" />
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl md:text-3xl font-bold tracking-tighter text-foreground">
                  <CountUp
                    end={stat.value}
                    suffix={stat.suffix}
                    duration={2.5}
                    separator=","
                    enableScrollSpy
                    scrollSpyOnce
                  />
                </h3>
                <p className="text-xs md:text-sm font-medium text-muted-foreground md:text-base">
                  {stat.label}
                </p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
} 