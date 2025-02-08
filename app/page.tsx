import { Metadata } from "next"
import { AnimatedHero } from "@/components/animated-hero"
import { StatsSection } from "@/components/stats-section"
import { FeaturesGrid } from "@/components/features-grid"
import { ArrowRight, BookOpen, Users, Trophy, Target, Lightbulb, Rocket, Info } from "lucide-react"
import Link from "next/link"
import { InnovationIcon } from "@/components/icons/innovation"
import { Button } from "@/components/ui/button"

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

      {/* Информационная секция */}
      <section className="relative py-20 overflow-hidden">
        <div className="container relative px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Инновационный подход */}
            <div className="relative p-6 rounded-2xl border bg-card">
              <div className="w-12 h-12 rounded-lg bg-orange-100/80 dark:bg-orange-500/10 flex items-center justify-center mb-4">
                <Lightbulb className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">
                Инновационный подход
              </h3>
              <p className="text-muted-foreground">
                Современные методики обучения и передовые технологии в агропромышленности
              </p>
            </div>

            {/* Экспертные знания */}
            <div className="relative p-6 rounded-2xl border bg-card">
              <div className="w-12 h-12 rounded-lg bg-orange-100/80 dark:bg-orange-500/10 flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">
                Экспертные знания
              </h3>
              <p className="text-muted-foreground">
                Курсы разработаны ведущими специалистами отрасли
              </p>
            </div>

            {/* Практический опыт */}
            <div className="relative p-6 rounded-2xl border bg-card">
              <div className="w-12 h-12 rounded-lg bg-orange-100/80 dark:bg-orange-500/10 flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">
                Практический опыт
              </h3>
              <p className="text-muted-foreground">
                Реальные кейсы и практические задания для закрепления навыков
              </p>
            </div>

            {/* Карьерный рост */}
            <div className="relative p-6 rounded-2xl border bg-card">
              <div className="w-12 h-12 rounded-lg bg-orange-100/80 dark:bg-orange-500/10 flex items-center justify-center mb-4">
                <Rocket className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">
                Карьерный рост
              </h3>
              <p className="text-muted-foreground">
                Развитие профессиональных компетенций и возможности для роста
              </p>
            </div>
          </div>
        </div>
      </section>

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Современные курсы */}
            <div className="relative p-6 rounded-2xl border border-orange-100/20 dark:border-orange-400/10 bg-white/50 dark:bg-background/50 backdrop-blur-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 via-white/80 to-white/30 dark:from-orange-500/[0.03] dark:via-background/80 dark:to-background/30 rounded-2xl" />
              <div className="relative">
                <div className="w-12 h-12 rounded-lg bg-orange-100/80 dark:bg-orange-500/10 flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2 bg-gradient-to-br from-orange-600 to-orange-500 dark:from-orange-400 dark:to-orange-300 bg-clip-text text-transparent">
                  Современные курсы
                </h3>
                <p className="text-muted-foreground">
                  Актуальные знания от ведущих экспертов агропромышленности
                </p>
              </div>
            </div>

            {/* Сообщество */}
            <div className="relative p-6 rounded-2xl border border-orange-100/20 dark:border-orange-400/10 bg-white/50 dark:bg-background/50 backdrop-blur-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 via-white/80 to-white/30 dark:from-orange-500/[0.03] dark:via-background/80 dark:to-background/30 rounded-2xl" />
              <div className="relative">
                <div className="w-12 h-12 rounded-lg bg-orange-100/80 dark:bg-orange-500/10 flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2 bg-gradient-to-br from-orange-600 to-orange-500 dark:from-orange-400 dark:to-orange-300 bg-clip-text text-transparent">
                  Сообщество
                </h3>
                <p className="text-muted-foreground">
                  Общение с единомышленниками и обмен опытом
                </p>
              </div>
            </div>

            {/* Достижения */}
            <div className="relative p-6 rounded-2xl border border-orange-100/20 dark:border-orange-400/10 bg-white/50 dark:bg-background/50 backdrop-blur-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 via-white/80 to-white/30 dark:from-orange-500/[0.03] dark:via-background/80 dark:to-background/30 rounded-2xl" />
              <div className="relative">
                <div className="w-12 h-12 rounded-lg bg-orange-100/80 dark:bg-orange-500/10 flex items-center justify-center mb-4">
                  <Trophy className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2 bg-gradient-to-br from-orange-600 to-orange-500 dark:from-orange-400 dark:to-orange-300 bg-clip-text text-transparent">
                  Достижения
                </h3>
                <p className="text-muted-foreground">
                  Система наград и сертификации для отслеживания прогресса
                </p>
              </div>
            </div>

            {/* Практические навыки */}
            <div className="relative p-6 rounded-2xl border border-orange-100/20 dark:border-orange-400/10 bg-white/50 dark:bg-background/50 backdrop-blur-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 via-white/80 to-white/30 dark:from-orange-500/[0.03] dark:via-background/80 dark:to-background/30 rounded-2xl" />
              <div className="relative">
                <div className="w-12 h-12 rounded-lg bg-orange-100/80 dark:bg-orange-500/10 flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2 bg-gradient-to-br from-orange-600 to-orange-500 dark:from-orange-400 dark:to-orange-300 bg-clip-text text-transparent">
                  Практические навыки
                </h3>
                <p className="text-muted-foreground">
                  Реальные кейсы и задачи из индустрии
                </p>
              </div>
            </div>

            {/* Инновации */}
            <div className="relative p-6 rounded-2xl border border-orange-100/20 dark:border-orange-400/10 bg-white/50 dark:bg-background/50 backdrop-blur-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 via-white/80 to-white/30 dark:from-orange-500/[0.03] dark:via-background/80 dark:to-background/30 rounded-2xl" />
              <div className="relative">
                <div className="w-12 h-12 rounded-lg bg-orange-100/80 dark:bg-orange-500/10 flex items-center justify-center mb-4">
                  <Lightbulb className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2 bg-gradient-to-br from-orange-600 to-orange-500 dark:from-orange-400 dark:to-orange-300 bg-clip-text text-transparent">
                  Инновации
                </h3>
                <p className="text-muted-foreground">
                  Новейшие технологии и методики в агропромышленности
                </p>
              </div>
            </div>

            {/* Развитие */}
            <div className="relative p-6 rounded-2xl border border-orange-100/20 dark:border-orange-400/10 bg-white/50 dark:bg-background/50 backdrop-blur-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 via-white/80 to-white/30 dark:from-orange-500/[0.03] dark:via-background/80 dark:to-background/30 rounded-2xl" />
              <div className="relative">
                <div className="w-12 h-12 rounded-lg bg-orange-100/80 dark:bg-orange-500/10 flex items-center justify-center mb-4">
                  <Rocket className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2 bg-gradient-to-br from-orange-600 to-orange-500 dark:from-orange-400 dark:to-orange-300 bg-clip-text text-transparent">
                  Развитие
                </h3>
                <p className="text-muted-foreground">
                  Постоянное обновление контента и новые возможности
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

