import { Metadata } from "next"
import { AnimatedHero } from "@/components/animated-hero"
import { StatsSection } from "@/components/stats-section"
import { WaveInfoSection } from "@/components/wave-info-section"
import { Button } from "@/components/ui/button"
import { ArrowRight, BookOpen, Users, Trophy, Target, Lightbulb, Rocket } from "lucide-react"
import Link from "next/link"
import { InnovationIcon } from "@/components/icons/innovation"

interface Feature {
  title: string
  description: string
  icon: React.ElementType
}

const features: Feature[] = [
  {
    title: "Современные курсы",
    description: "Актуальные знания от ведущих экспертов агропромышленности",
    icon: BookOpen,
  },
  {
    title: "Сообщество",
    description: "Общение с единомышленниками и обмен опытом",
    icon: Users,
  },
  {
    title: "Достижения",
    description: "Система наград и сертификации для отслеживания прогресса",
    icon: Trophy,
  },
  {
    title: "Практические навыки",
    description: "Реальные кейсы и задачи из индустрии",
    icon: Target,
  },
  {
    title: "Инновации",
    description: "Новейшие технологии и методики в агропромышленности",
    icon: Lightbulb,
  },
  {
    title: "Развитие",
    description: "Постоянное обновление контента и новые возможности",
    icon: Rocket,
  },
]

export const metadata: Metadata = {
  title: "АЛЛЕЛЬ АГРО - Платформа",
  description: "Образовательная платформа для специалистов агропромышленности",
}

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero секция */}
      <section className="relative w-full overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_100%)]" />
        <div className="container relative px-4 md:px-6">
          <AnimatedHero />
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
              <h2 className="text-3xl font-bold text-foreground">
                Инновации в агропромышленности
              </h2>
              <p className="text-muted-foreground">
                Мы используем передовые технологии и методики обучения для подготовки специалистов будущего
              </p>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span className="text-foreground">Современные методики</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span className="text-foreground">Эксперты отрасли</span>
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

      {/* Особенности */}
      <section className="container space-y-6 py-8 md:py-12 lg:py-24">
        <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
          {features.map((feature) => (
            <div 
              key={feature.title} 
              className="relative overflow-hidden rounded-lg border bg-card p-2"
            >
              <div className="card-hover flex h-[180px] flex-col justify-between rounded-md p-6">
                <feature.icon className="h-12 w-12 text-primary" />
                <div className="space-y-2">
                  <h3 className="font-bold text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

