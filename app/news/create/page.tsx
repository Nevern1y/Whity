"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft } from "lucide-react"

export default function CreateNewsPage() {
  const router = useRouter()

  return (
    <div className="container py-6 md:py-8">
      {/* Мобильный заголовок */}
      <div className="flex items-center gap-4 mb-6 md:hidden">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Создать новость</h1>
      </div>

      {/* Десктопный заголовок */}
      <h1 className="text-2xl font-bold mb-6 hidden md:block">Создать новость</h1>

      <div className="max-w-2xl">
        <form className="space-y-4">
          <div className="space-y-2">
            <Input 
              placeholder="Заголовок новости"
              className="text-lg md:text-xl font-medium"
            />
          </div>

          <div className="space-y-2">
            <Textarea 
              placeholder="Текст новости..."
              className="min-h-[200px] md:min-h-[300px]"
            />
          </div>

          {/* Мобильные кнопки */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t md:hidden">
            <div className="container flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => router.back()}
              >
                Отмена
              </Button>
              <Button className="flex-1">
                Опубликовать
              </Button>
            </div>
          </div>

          {/* Десктопные кнопки */}
          <div className="hidden md:flex justify-end gap-2">
            <Button variant="outline" onClick={() => router.back()}>
              Отмена
            </Button>
            <Button>
              Опубликовать
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
} 