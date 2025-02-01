"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Rocket, Info } from "lucide-react"
import Link from "next/link"

export function AnimatedHero() {
  return (
    <div className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
      <div className="container flex max-w-[64rem] flex-col items-center gap-6 text-center">
        <motion.h1 
          className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Инновационный подход
        </motion.h1>
        <motion.p 
          className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Современные методики обучения и передовые технологии в агропромышленности
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 mt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Button asChild size="lg" className="gap-2">
            <Link href="/courses">
              <Rocket className="h-4 w-4" />
              <span className="whitespace-nowrap">Перейти к обучению</span>
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="gap-2">
            <Link href="/about">
              <Info className="h-4 w-4" />
              <span className="whitespace-nowrap">Узнать больше о платформе</span>
            </Link>
          </Button>
        </motion.div>
      </div>
    </div>
  )
} 