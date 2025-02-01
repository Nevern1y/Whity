import { Metadata } from "next"
import { AnimatedHero } from "@/components/animated-hero"
import { StatsSection } from "@/components/stats-section"
import { WaveInfoSection } from "@/components/wave-info-section"
import { FeaturesGrid } from "@/components/features-grid"
import { ArrowRight, BookOpen, Users, Trophy, Target, Lightbulb, Rocket } from "lucide-react"
import Link from "next/link"
import { InnovationIcon } from "@/components/icons/innovation"

const features = [
  {
    title: "Современные курсы",
    description: "Актуальные знания от ведущих экспертов агропромышленности",
    iconName: "BookOpen",
  },
  {
    title: "Сообщество",
    description: "Общение с единомышленниками и обмен опытом",
    iconName: "Users",
  },
  {
    title: "Достижения",
    description: "Система наград и сертификации для отслеживания прогресса",
    iconName: "Trophy",
  },
  {
    title: "Практические навыки",
    description: "Реальные кейсы и задачи из индустрии",
    iconName: "Target",
  },
  {
    title: "Инновации",
    description: "Новейшие технологии и методики в агропромышленности",
    iconName: "Lightbulb",
  },
  {
    title: "Развитие",
    description: "Постоянное обновление контента и новые возможности",
    iconName: "Rocket",
  },
] as const

export const metadata: Metadata = {
  title: "АЛЛЕЛЬ АГРО - Платформа",
  description: "Образовательная платформа для специалистов агропромышленности",
}

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-white via-gray-50 to-white dark:from-background dark:via-background/80 dark:to-background">
      {/* Общий фоновый паттерн для всей страницы */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] dark:bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] pointer-events-none" />

      {/* Hero секция */}
      <section className="relative w-full overflow-hidden">
        <div className="container relative px-4 md:px-6">
          <AnimatedHero />
        </div>
      </section>

      {/* Статистика */}
      <StatsSection />

      {/* Курсы */}
      <WaveInfoSection />

      {/* Призыв к действию */}
      <section className="relative py-20 overflow-hidden">
        <div className="container relative px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                Инновации в агропромышленности
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Мы используем передовые технологии и методики обучения для подготовки специалистов будущего
              </p>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                  <span className="text-gray-700 dark:text-gray-200">Современные методики</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                  <span className="text-gray-700 dark:text-gray-200">Эксперты отрасли</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-radial from-emerald-100 to-transparent dark:from-emerald-900/20 dark:to-transparent opacity-30" />
              <InnovationIcon />
            </div>
          </div>
        </div>
      </section>

      {/* Особенности */}
      <section className="relative py-24 overflow-hidden">
        <div className="container relative space-y-6 py-8 md:py-12 lg:py-24">
          <FeaturesGrid features={features} />
        </div>
      </section>
    </div>
  )
}

