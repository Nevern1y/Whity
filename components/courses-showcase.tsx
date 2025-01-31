"use client"

import { motion } from "framer-motion"
import { ArrowRight, BookOpen, Users, Clock } from "lucide-react"
import Link from "next/link"
import { WaveCard } from "@/components/ui/wave-card"

const featuredCourses = [
  {
    title: "Современное птицеводство",
    description: "Комплексный курс по управлению птицефабрикой",
    students: 234,
    duration: "6 недель",
    level: "Продвинутый",
    href: "/courses/modern-poultry",
  },
  {
    title: "Ветеринария птиц",
    description: "Диагностика и лечение заболеваний",
    students: 189,
    duration: "8 недель",
    level: "Профессиональный",
    href: "/courses/bird-veterinary",
  },
  {
    title: "Генетика в птицеводстве",
    description: "Основы селекции и разведения",
    students: 156,
    duration: "4 недели",
    level: "Базовый",
    href: "/courses/poultry-genetics",
  },
]

export function CoursesShowcase() {
  return (
    <section className="py-20">
      <div className="container px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-center mb-12"
        >
          Популярные курсы
        </motion.h2>
        <div className="grid md:grid-cols-3 gap-6">
          {featuredCourses.map((course, index) => (
            <Link key={course.title} href={course.href}>
              <WaveCard
                className="h-full cursor-pointer"
                icon={<BookOpen className="h-6 w-6 text-white" />}
                title={course.title}
                subtitle={course.description}
              >
                <div className="mt-4 flex items-center justify-between text-sm text-white/80">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{course.students} студентов</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{course.duration}</span>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-center text-white font-medium">
                  <span className="mr-2">Подробнее</span>
                  <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </WaveCard>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
} 