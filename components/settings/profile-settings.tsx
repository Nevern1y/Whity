"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Settings2, Mail, User, Lock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface ProfileSettingsProps {
  user: {
    name?: string | null
    email?: string | null
  }
}

export function ProfileSettings({ user }: ProfileSettingsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const form = useForm({
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }
  })

  const onSubmit = async (data: any) => {
    try {
      setIsLoading(true)
      
      // Проверяем, изменился ли пароль
      if (data.newPassword) {
        if (data.newPassword !== data.confirmPassword) {
          toast.error('Пароли не совпадают')
          return
        }
        if (!data.currentPassword) {
          toast.error('Введите текущий пароль')
          return
        }
      }

      const response = await fetch('/api/user/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        })
      })

      if (!response.ok) throw new Error('Failed to update profile')

      toast.success('Настройки обновлены')
      setIsOpen(false)
      router.refresh()
    } catch (error) {
      toast.error('Ошибка при обновлении настроек')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings2 className="mr-2 h-4 w-4" />
          Настройки профиля
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Настройки профиля</DialogTitle>
          <DialogDescription>
            Обновите ваши персональные данные
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                <User className="w-4 h-4 inline mr-2" />
                Имя
              </Label>
              <Input
                id="name"
                {...form.register('name')}
                placeholder="Ваше имя"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                <Mail className="w-4 h-4 inline mr-2" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                {...form.register('email')}
                placeholder="your@email.com"
              />
            </div>

            <div className="space-y-2">
              <Label>
                <Lock className="w-4 h-4 inline mr-2" />
                Изменить пароль
              </Label>
              <Input
                type="password"
                {...form.register('currentPassword')}
                placeholder="Текущий пароль"
              />
              <Input
                type="password"
                {...form.register('newPassword')}
                placeholder="Новый пароль"
              />
              <Input
                type="password"
                {...form.register('confirmPassword')}
                placeholder="Подтвердите новый пароль"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Сохранение...' : 'Сохранить изменения'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 