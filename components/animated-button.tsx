"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

export function AnimatedButton() {
  return (
    <Button
      size="lg"
      href="/courses"
      className="group"
    >
      Начать обучение
      <motion.span
        animate={{ x: [0, 5, 0] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
      >
        <ArrowRight className="ml-2 h-4 w-4" />
      </motion.span>
    </Button>
  )
} 