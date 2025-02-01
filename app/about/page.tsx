import { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Users, Award, Target, CheckCircle2 } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "О нас | Аллель Агро",
  description: "Образовательная платформа для специалистов агропромышленного комплекса",
}

export default function AboutPage() {
  return (
    <>
      {/* Анимированный паттерн */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_100%_200px,#4c9c2a12,transparent)]" />
      </div>

      <div className="container py-8 relative">
        {/* Hero секция */}
        <Card className="mb-8 relative overflow-hidden border-none bg-gradient-to-br from-primary/5 to-background">
          <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))]" />
          <CardHeader className="relative">
            <CardTitle className="text-center text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
              О платформе Аллель Агро
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6 relative">
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Инновационная образовательная платформа, объединяющая экспертов и специалистов агропромышленного сектора
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/courses" passHref>
                <Button size="lg" className="shadow-lg hover:shadow-xl transition-shadow">
                  Начать обучение
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="backdrop-blur-sm">
                <Link href="/contact">Связаться с нами</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Статистика */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            icon={BookOpen}
            title="50+"
            description="Курсов"
          />
          <StatsCard
            icon={Users}
            title="1000+"
            description="Студентов"
          />
          <StatsCard
            icon={Award}
            title="200+"
            description="Сертификатов"
          />
          <StatsCard
            icon={Target}
            title="95%"
            description="Довольных клиентов"
          />
        </div>

        {/* Преимущества */}
        <Card className="mb-8 bg-gradient-to-br from-background to-primary/5">
          <CardHeader>
            <CardTitle className="text-center text-3xl">Почему выбирают нас</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-8">
              <Feature
                icon={CheckCircle2}
                title="Экспертность"
                description="Курсы разработаны ведущими специалистами отрасли с многолетним опытом"
              />
              <Feature
                icon={CheckCircle2}
                title="Практичность"
                description="Реальные кейсы и задачи из агропромышленного сектора"
              />
              <Feature
                icon={CheckCircle2}
                title="Инновационность"
                description="Современные методики обучения и передовые технологии"
              />
            </div>
          </CardContent>
        </Card>

        {/* Декоративный элемент */}
        <div className="mb-8 relative h-48 overflow-hidden rounded-lg">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent" />
          
          {/* Анимированные круги */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -left-4 -top-4 w-24 h-24 bg-primary/10 rounded-full animate-float-slow" />
            <div className="absolute left-1/4 -bottom-8 w-32 h-32 bg-primary/5 rounded-full animate-float-medium" />
            <div className="absolute right-1/3 top-1/4 w-16 h-16 bg-primary/20 rounded-full animate-float-fast" />
            <div className="absolute right-1/4 -top-6 w-20 h-20 bg-primary/15 rounded-full animate-float-medium" />
          </div>

          {/* Анимированная сетка */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:16px_16px] animate-grid-flow" />
        </div>

        {/* Миссия */}
        <Card className="bg-gradient-to-br from-primary/5 to-background border-none">
          <CardHeader>
            <CardTitle className="text-center text-3xl">Наша миссия</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-muted-foreground text-center max-w-3xl mx-auto leading-relaxed">
              Создать доступную и эффективную образовательную среду для специалистов агропромышленного комплекса, 
              способствуя развитию отрасли через внедрение инновационных технологий и лучших практик
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

function StatsCard({ icon: Icon, title, description }: {
  icon: any
  title: string
  description: string
}) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-none bg-gradient-to-br from-background to-primary/5">
      <CardContent className="p-6 text-center">
        <Icon className="h-8 w-8 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
        <h3 className="text-2xl font-bold mb-1">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

function Feature({ icon: Icon, title, description }: {
  icon: any
  title: string
  description: string
}) {
  return (
    <div className="text-center space-y-3 p-6 rounded-lg hover:bg-primary/5 transition-colors duration-300">
      <Icon className="h-8 w-8 text-primary mx-auto" />
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
} 