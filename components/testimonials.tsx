"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Quote } from "lucide-react"

const testimonials = [
  {
    name: "Анна Петрова",
    role: "Специалист по птицеводству",
    image: "/testimonials/user1.jpg",
    content: "Отличная платформа для обучения. Материал подается структурированно и понятно.",
  },
  {
    name: "Иван Сергеев",
    role: "Начинающий фермер",
    image: "/testimonials/user2.jpg",
    content: "Благодаря курсам смог начать свое дело. Спасибо за качественные материалы!",
  },
  {
    name: "Мария Иванова",
    role: "Студент агровуза",
    image: "/testimonials/user3.jpg",
    content: "Дополняю университетское образование практическими знаниями с платформы.",
  },
]

export function Testimonials() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container px-4 mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
          Отзывы наших студентов
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name} className="relative">
              <CardContent className="pt-12">
                <Quote className="absolute top-6 left-6 h-8 w-8 text-primary/20" />
                <p className="mb-6 text-muted-foreground">{testimonial.content}</p>
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={testimonial.image} />
                    <AvatarFallback>{testimonial.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
} 