"use client"

import { motion } from "framer-motion"
import { Users, BookOpen, Award, Trophy } from "lucide-react"
import CountUp from 'react-countup'

const stats = [
  {
    icon: Users,
    value: 1000,
    label: "Студентов",
    suffix: "+",
  },
  {
    icon: BookOpen,
    value: 50,
    label: "Курсов",
    suffix: "+",
  },
  {
    icon: Award,
    value: 5000,
    label: "Выданных сертификатов",
    suffix: "+",
  },
  {
    icon: Trophy,
    value: 98,
    label: "Процент успешных выпускников",
    suffix: "%",
  },
]

export function StatsSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-background to-primary/5">
      <div className="container px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100" />
              <div className="relative p-6 text-center space-y-4">
                <stat.icon className="h-8 w-8 mx-auto text-primary" />
                <div className="text-3xl md:text-4xl font-bold tracking-tight">
                  <CountUp end={stat.value} suffix={stat.suffix} duration={2.5} />
                </div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
} 