"use client"

import { motion } from "framer-motion"

export function DecorativeBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Градиентный фон */}
      <div className="absolute inset-0 bg-gradient-to-br from-background to-muted/50" />
      
      {/* Декоративные линии */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.03] dark:opacity-[0.02]"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <pattern
          id="grid"
          width="10"
          height="10"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 10 0 L 0 0 0 10"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
          />
        </pattern>
        <rect width="100" height="100" fill="url(#grid)" />
      </svg>

      {/* Анимированные круги */}
      <motion.div
        className="absolute -top-1/2 -right-1/2 w-full h-full"
        animate={{
          rotate: [0, 360],
        }}
        transition={{
          duration: 50,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </motion.div>
      <motion.div
        className="absolute -bottom-1/2 -left-1/2 w-full h-full"
        animate={{
          rotate: [360, 0],
        }}
        transition={{
          duration: 50,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </motion.div>
    </div>
  )
} 