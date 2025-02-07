"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Level } from "@/types/prisma"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Video,
  FileText,
  Image as ImageIcon,
  Link as LinkIcon,
  Upload
} from "lucide-react"

interface CourseData {
  title: string
  description: string
  level: Level
  duration: string
  image: string
  published?: boolean
}

export default function CreateCoursePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [courseData, setCourseData] = useState<CourseData>({
    title: "",
    description: "",
    level: "BEGINNER" as Level,
    duration: "",
    image: ""
  })
  const [contentType, setContentType] = useState<"video" | "text" | "mixed">("video")

  const handleSubmit = async () => {
    try {
      setIsLoading(true)

      const response = await fetch("/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...courseData,
          image: "/placeholder-course.jpg",
          duration: courseData.duration || "0"
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create course")
      }

      const course = await response.json()
      
      toast({
        title: "Успех",
        description: "Курс успешно создан",
      })

      setTimeout(() => {
        router.push("/courses")
        router.refresh()
      }, 1000)
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось создать курс",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container py-8 max-w-4xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Создание нового курса</h1>
          <p className="text-muted-foreground mt-2">
            Заполните информацию о курсе и добавьте учебные материалы
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <form className="space-y-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Название курса</Label>
                  <Input 
                    id="title" 
                    placeholder="Введите название курса"
                    value={courseData.title}
                    onChange={(e) => setCourseData(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Описание</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Опишите содержание и цели курса"
                    className="min-h-[100px]"
                    value={courseData.description}
                    onChange={(e) => setCourseData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Уровень сложности</Label>
                    <Select 
                      value={courseData.level}
                      onValueChange={(value: Level) => setCourseData(prev => ({ ...prev, level: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите уровень" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BEGINNER">Начинающий</SelectItem>
                        <SelectItem value="INTERMEDIATE">Средний</SelectItem>
                        <SelectItem value="ADVANCED">Продвинутый</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Продолжительность</Label>
                    <Input 
                      placeholder="Например: 2 недели"
                      value={courseData.duration}
                      onChange={(e) => setCourseData(prev => ({ ...prev, duration: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Тип контента</Label>
                <Tabs 
                  value={contentType} 
                  onValueChange={setContentType as (value: string) => void}
                >
                  <TabsList className="grid grid-cols-3 w-full">
                    <TabsTrigger value="video">
                      <Video className="mr-2 h-4 w-4" />
                      Видео
                    </TabsTrigger>
                    <TabsTrigger value="text">
                      <FileText className="mr-2 h-4 w-4" />
                      Текст
                    </TabsTrigger>
                    <TabsTrigger value="mixed">
                      <ImageIcon className="mr-2 h-4 w-4" />
                      Смешанный
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="video" className="space-y-4">
                    <div className="border-2 border-dashed rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        Перетащите видео сюда или нажмите для загрузки
                      </p>
                      <Button variant="secondary" className="mt-4">
                        Выбрать файл
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="text" className="space-y-4">
                    <Textarea 
                      placeholder="Введите текстовый материал курса..."
                      className="min-h-[200px]"
                    />
                  </TabsContent>

                  <TabsContent value="mixed" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Button variant="outline" className="h-32 flex flex-col items-center">
                        <ImageIcon className="h-8 w-8 mb-2" />
                        <span>Добавить изображение</span>
                      </Button>
                      <Button variant="outline" className="h-32 flex flex-col items-center">
                        <LinkIcon className="h-8 w-8 mb-2" />
                        <span>Добавить ссылку</span>
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="flex justify-end space-x-4">
                <Button 
                  variant="outline" 
                  onClick={() => router.back()}
                >
                  Отмена
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={isLoading || !courseData.title || !courseData.description}
                >
                  {isLoading ? "Создание..." : "Создать курс"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

