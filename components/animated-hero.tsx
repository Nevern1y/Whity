"use client"

import { withAnimation } from "@/components/hoc/with-animation"
import { Button } from "@/components/ui/button"
import { Rocket, Info } from "lucide-react"
import Link from "next/link"
import type { m } from "framer-motion"

interface AnimatedHeroProps {
  m: typeof m | null
  isReady: boolean
}

function AnimatedHeroBase({ m, isReady }: AnimatedHeroProps) {
  // If not ready or no motion components, render static version
  if (!isReady || !m) {
    return (
      <div className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
        <div className="container flex max-w-[64rem] flex-col items-center gap-6 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
            Инновационный подход
          </h1>
          <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
            Современные методики обучения и передовые технологии в агропромышленности
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <Link href="/courses">
              <Button size="lg" className="flex items-center gap-2">
                <Rocket className="h-4 w-4" />
                <span className="whitespace-nowrap">Перейти к обучению</span>
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="outline" size="lg" className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                <span className="whitespace-nowrap">Узнать больше о платформе</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // With motion components
  const { div: Motion, h1: H1, p: P } = m

  return (
    <Motion
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32"
    >
      <div className="container flex max-w-[64rem] flex-col items-center gap-6 text-center">
        <H1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl"
        >
          Инновационный подход
        </H1>
        <P
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8"
        >
          Современные методики обучения и передовые технологии в агропромышленности
        </P>
        <Motion
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 mt-4"
        >
          <Link href="/courses">
            <Button size="lg" className="flex items-center gap-2">
              <Rocket className="h-4 w-4" />
              <span className="whitespace-nowrap">Перейти к обучению</span>
            </Button>
          </Link>
          <Link href="/about">
            <Button variant="outline" size="lg" className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              <span className="whitespace-nowrap">Узнать больше о платформе</span>
            </Button>
          </Link>
        </Motion>
      </div>
    </Motion>
  )
}

export const AnimatedHero = withAnimation(AnimatedHeroBase) 