"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { BookOpen, Users, Trophy, Target, Lightbulb, Rocket } from "lucide-react"

// Создаем маппинг иконок
const iconMap = {
  BookOpen,
  Users,
  Trophy,
  Target,
  Lightbulb,
  Rocket
} as const

interface Feature {
  title: string
  description: string
  iconName: keyof typeof iconMap
}

interface FeaturesGridProps {
  features: ReadonlyArray<Feature> | Feature[]
}

export function FeaturesGrid({ features }: FeaturesGridProps) {
  return (
    <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
      {features.map((feature, index) => {
        const Icon = iconMap[feature.iconName]
        return (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div className="group relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 hover:shadow-lg transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-100 dark:from-emerald-500/10 to-transparent blur-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative">
                <div className="mb-4 inline-flex p-3 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/20 transition-colors duration-300">
                  <Icon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors duration-300">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>

              <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-emerald-200 dark:via-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </motion.div>
        )
      })}
    </div>
  )
} 