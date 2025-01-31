"use client"

import { motion } from "framer-motion"

export function AnimatedHero() {
  return (
    <div className="flex flex-col items-center space-y-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
          Добро пожаловать в{" "}
          <span className="text-primary">Аллель Агро</span>
        </h1>
      </motion.div>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mx-auto max-w-[700px] text-muted-foreground md:text-xl"
      >
        Образовательная платформа для специалистов агропромышленности
      </motion.p>
    </div>
  )
} 