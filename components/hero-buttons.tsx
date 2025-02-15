"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Info } from "lucide-react"
import Link from "next/link"
import { useAnimation } from "@/components/providers/animation-provider"

export function HeroButtons() {
  const { m } = useAnimation()

  return (
    <m.div
      className="flex flex-col sm:flex-row gap-4 mt-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Link href="/courses">
        <Button size="lg" className="group">
          Начать обучение
          <m.span
            animate={{ x: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <ArrowRight className="ml-2 h-4 w-4" />
          </m.span>
        </Button>
      </Link>
      <Link href="/about">
        <Button variant="outline" size="lg" className="flex items-center gap-2">
          <Info className="h-4 w-4" />
          <span>Узнать больше о платформе</span>
        </Button>
      </Link>
    </m.div>
  )
} 