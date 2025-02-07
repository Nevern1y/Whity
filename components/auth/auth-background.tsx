"use client"

import { motion } from "framer-motion"

export function AuthBackground() {
  return (
    <>
      {/* Градиентные круги */}
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-primary/20 blur-3xl" />
      
      {/* Анимированная сетка */}
      <div className="absolute inset-0 bg-grid-white/10 bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_100%)]" />
      
      {/* Анимированные блики */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/30 rounded-full blur-2xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-primary/30 rounded-full blur-2xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2 // Добавляем задержку для второго блика
        }}
      />
    </>
  )
} 