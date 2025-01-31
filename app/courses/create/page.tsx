"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
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

export default function CreateCoursePage() {
  const [contentType, setContentType] = useState<"video" | "text" | "mixed">("video")

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
                  <Input id="title" placeholder="Введите название курса" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Описание</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Опишите содержание и цели курса"
                    className="min-h-[100px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Уровень сложности</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите уровень" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Начальный</SelectItem>
                        <SelectItem value="intermediate">Средний</SelectItem>
                        <SelectItem value="advanced">Продвинутый</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Продолжительность</Label>
                    <Input placeholder="Например: 2 недели" />
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
                      <Button variant="outline" className="h-32">
                        <div className="text-center">
                          <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                          <span>Добавить изображение</span>
                        </div>
                      </Button>
                      <Button variant="outline" className="h-32">
                        <div className="text-center">
                          <LinkIcon className="h-8 w-8 mx-auto mb-2" />
                          <span>Добавить ссылку</span>
                        </div>
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="flex justify-end space-x-4">
                <Button variant="outline">Отмена</Button>
                <Button>Создать курс</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

