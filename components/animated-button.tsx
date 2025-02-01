"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

export function AnimatedButton() {
  return (
    <Link href="/courses" passHref>
      <Button size="lg" className="group">
        Начать обучение
        <motion.span
          animate={{ x: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <ArrowRight className="ml-2 h-4 w-4" />
        </motion.span>
      </Button>
    </Link>
  )
} 