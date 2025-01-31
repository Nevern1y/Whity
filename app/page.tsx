import { Metadata } from "next"
import { AnimatedHero } from "@/components/animated-hero"
import { StatsSection } from "@/components/stats-section"
import { WaveInfoSection } from "@/components/wave-info-section"
import { HeroButtons } from "@/components/hero-buttons"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { InnovationIcon } from "@/components/icons/innovation"

export const metadata: Metadata = {
  title: "АЛЛЕЛЬ АГРО - Платформа",
  description: "Образовательная платформа для специалистов агропромышленности",
}

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero секция */}
      <section className="relative w-full py-24 md:py-32 overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_100%)]" />
        <div className="container relative px-4 md:px-6">
          <AnimatedHero />
          <HeroButtons />
        </div>
      </section>

      {/* Статистика */}
      <StatsSection />

      {/* Курсы */}
      <WaveInfoSection />

      {/* Призыв к действию */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-b from-background to-primary/5">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="container relative px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold">Инновации в агропромышленности</h2>
              <p className="text-muted-foreground">
                Мы используем передовые технологии и методики обучения для подготовки специалистов будущего
              </p>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span>Современные методики</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span>Эксперты отрасли</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-radial from-primary/20 to-transparent opacity-30" />
              <InnovationIcon />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

