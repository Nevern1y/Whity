"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ImageUpload } from "@/components/image-upload"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select"

const formSchema = z.object({
  title: z.string().min(1, "Название обязательно"),
  description: z.string().min(1, "Описание обязательно"),
  image: z.string().optional(),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  duration: z.string()
})

type FormValues = z.infer<typeof formSchema>

interface CourseFormProps {
  courseId?: string
  onSuccess?: () => void
}

export function CourseForm({ courseId, onSuccess }: CourseFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: async () => {
      if (courseId) {
        try {
          const response = await fetch(`/api/courses/${courseId}`)
          if (!response.ok) {
            throw new Error()
          }
          const data = await response.json()
          return {
            title: data.title,
            description: data.description,
            image: data.image || "",
            level: data.level as FormValues["level"],
            duration: data.duration
          }
        } catch {
          toast.error("Ошибка при загрузке данных курса")
          return {
            title: "",
            description: "",
            image: "",
            level: "BEGINNER",
            duration: ""
          }
        }
      }
      return {
        title: "",
        description: "",
        image: "",
        level: "BEGINNER",
        duration: ""
      }
    }
  })

  const onSubmit = async (values: FormValues) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(values)
      })

      if (!response.ok) {
        throw new Error()
      }

      toast.success("Курс успешно обновлен")
      onSuccess?.()
    } catch {
      toast.error("Что-то пошло не так")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Изображение курса</FormLabel>
              <FormControl>
                <ImageUpload
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Название</FormLabel>
                <FormControl>
                  <Input disabled={isLoading} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="level"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Уровень</FormLabel>
                <Select 
                  disabled={isLoading} 
                  onValueChange={field.onChange} 
                  value={field.value}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите уровень" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="BEGINNER">Начальный</SelectItem>
                    <SelectItem value="INTERMEDIATE">Средний</SelectItem>
                    <SelectItem value="ADVANCED">Продвинутый</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Описание</FormLabel>
              <FormControl>
                <Textarea disabled={isLoading} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Длительность (в часах)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  disabled={isLoading} 
                  {...field} 
                  placeholder="Например: 8"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            Сохранить изменения
          </Button>
        </div>
      </form>
    </Form>
  )
} 