"use client"

import { useState, FormEvent } from "react"
import { useSession } from "next-auth/react"
import { useSettings } from "@/hooks/use-settings"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Camera, Palette, Bell, Lock, User, Globe, Phone, Mail, Building2, MapPin, Check, Sun, Moon, Laptop, Shield, Key, History, AlertTriangle } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { EditProfilePhoto } from "@/components/edit-profile-photo"
import { UploadProfilePhoto } from "@/components/upload-profile-photo"
import Image from "next/image"

interface SecurityLog {
  id: string
  event: string
  ip: string
  location: string
  date: string
}

export default function SettingsPage() {
  const { data: session } = useSession()
  const settings = useSettings()
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [sessionTimeout, setSessionTimeout] = useState(30)

  const handleProfileUpdate = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsLoading(true)
    
    try {
      const formData = new FormData(event.target as HTMLFormElement)
      const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        company: formData.get('company'),
        theme: settings.theme,
        profileBackground: settings.profileBackground,
        notificationSettings: settings.notificationSettings,
      }
      
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error()
      
      toast.success('Настройки успешно сохранены')
      router.refresh()
    } catch (error) {
      toast.error('Произошла ошибка при сохранении')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData(event.target as HTMLFormElement)
      const data = {
        currentPassword: formData.get('currentPassword'),
        newPassword: formData.get('newPassword'),
        confirmPassword: formData.get('confirmPassword'),
      }

      if (data.newPassword !== data.confirmPassword) {
        toast.error('Пароли не совпадают')
        return
      }

      const response = await fetch('/api/settings/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message)
      }

      setTimeout(() => {
        toast.success('Пароль успешно обновлен')
      }, 0);
      (event.target as HTMLFormElement).reset()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Произошла ошибка при обновлении пароля')
    } finally {
      setIsLoading(false)
    }
  }

  // Пример логов безопасности
  const securityLogs: SecurityLog[] = [
    {
      id: '1',
      event: 'Успешный вход',
      ip: '192.168.1.1',
      location: 'Москва, Россия',
      date: '2024-03-10 15:30'
    },
    // ... другие логи
  ]

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="container max-w-6xl mx-auto px-4">
        {/* Заголовок */}
        <div className="py-6 md:py-8 text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Настройки</h1>
          <p className="text-muted-foreground mt-1">
            Управляйте настройками вашего аккаунта и предпочтениями
          </p>
        </div>

        <Separator className="mb-6" />

        {/* Адаптивные вкладки */}
        <Tabs defaultValue="profile" className="space-y-6">
          <div className="sticky top-[64px] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 pb-4">
            <ScrollArea className="w-full">
              <TabsList className="inline-flex w-auto justify-start md:justify-center p-1 mb-4">
                <TabsTrigger value="profile" className="min-w-[120px]">
                  <User className="h-4 w-4 mr-2" />
                  Профиль
                </TabsTrigger>
                <TabsTrigger value="appearance" className="min-w-[120px]">
                  <Palette className="h-4 w-4 mr-2" />
                  Вид
                </TabsTrigger>
                <TabsTrigger value="notifications" className="min-w-[120px]">
                  <Bell className="h-4 w-4 mr-2" />
                  Уведомления
                </TabsTrigger>
                <TabsTrigger value="security" className="min-w-[120px]">
                  <Lock className="h-4 w-4 mr-2" />
                  Безопасность
                </TabsTrigger>
              </TabsList>
            </ScrollArea>
          </div>

          <TabsContent value="profile">
            <div className="grid gap-6">
              {/* Фото профиля */}
              <Card>
                <CardHeader>
                  <CardTitle>Фото профиля</CardTitle>
                  <CardDescription>
                    Обновите ваше фото профиля и фон страницы
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-24 rounded-full overflow-hidden bg-muted">
                        <Image
                          src={session?.user?.image || "/placeholder.svg"}
                          alt="Profile photo"
                          width={96}
                          height={96}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">Фото профиля</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Рекомендуемый размер 200x200 пикселей
                        </p>
                        <UploadProfilePhoto />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <Label>Фон профиля</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {/* Превью фонов */}
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div
                          key={i}
                          className="relative aspect-[2/1] rounded-lg overflow-hidden cursor-pointer group"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary-foreground opacity-80 group-hover:opacity-100 transition-opacity" />
                          <div className="absolute inset-0 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                            <Check className="h-6 w-6" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Личная информация */}
              <Card>
                <CardHeader>
                  <CardTitle>Личная информация</CardTitle>
                  <CardDescription>
                    Обновите вашу личную информацию
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Имя</Label>
                        <Input id="name" defaultValue={session?.user?.name || ''} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" defaultValue={session?.user?.email || ''} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Телефон</Label>
                        <Input id="phone" type="tel" placeholder="+7 (XXX) XXX-XXXX" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company">Компания</Label>
                        <Input id="company" placeholder="Название компании" />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Сохранение..." : "Сохранить изменения"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>Внешний вид</CardTitle>
                <CardDescription>
                  Настройте внешний вид вашего профиля
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Выбор темы */}
                <div className="space-y-4">
                  <Label>Тема оформления</Label>
                  <div className="grid grid-cols-3 gap-4">
                    {themes.map((theme) => (
                      <Button
                        key={theme.value}
                        variant={settings.theme === theme.value ? "default" : "outline"}
                        className="flex flex-col items-center gap-2 p-4"
                        onClick={() => settings.setTheme(theme.value as any)}
                      >
                        {theme.icon}
                        <span>{theme.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Выбор фона профиля */}
                <div className="space-y-4">
                  <Label>Фон профиля</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {backgrounds.map((bg) => (
                      <div
                        key={bg.value}
                        className={cn(
                          "relative aspect-video rounded-lg overflow-hidden cursor-pointer group",
                          bg.preview
                        )}
                        onClick={() => settings.setProfileBackground(bg.value)}
                      >
                        {settings.profileBackground === bg.value && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <Check className="h-6 w-6 text-white" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Уведомления</CardTitle>
                <CardDescription>
                  Настройте параметры уведомлений
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email уведомления</Label>
                    <div className="text-sm text-muted-foreground">
                      Получать уведомления на email
                    </div>
                  </div>
                  <Switch
                    checked={settings.notificationSettings.email}
                    onCheckedChange={(checked) => {
                      settings.setNotificationSettings({ email: checked })
                      handleProfileUpdate({ preventDefault: () => {} } as React.FormEvent)
                    }}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push уведомления</Label>
                    <div className="text-sm text-muted-foreground">
                      Получать push-уведомления в браузере
                    </div>
                  </div>
                  <Switch />
                </div>
                <Separator />
                <div className="space-y-4">
                  <Label>Типы уведомлений</Label>
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="updates">Обновления курсов</Label>
                      <Switch id="updates" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="comments">Комментарии</Label>
                      <Switch id="comments" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="mentions">Упоминания</Label>
                      <Switch id="mentions" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Смена пароля */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Key className="h-5 w-5 text-muted-foreground" />
                    <CardTitle>Смена пароля</CardTitle>
                  </div>
                  <CardDescription>
                    Обновите ваш пароль для обеспечения безопасности аккаунта
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordUpdate} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Текущий пароль</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          name="currentPassword"
                          type={showCurrentPassword ? "text" : "password"}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? "Скрыть" : "Показать"}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Новый пароль</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          name="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? "Скрыть" : "Показать"}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Подтвердите новый пароль</Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Обновление..." : "Обновить пароль"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Двухфакторная аутентификация */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-muted-foreground" />
                    <CardTitle>Двухфакторная аутентификация</CardTitle>
                  </div>
                  <CardDescription>
                    Дополнительный уровень защиты для вашего аккаунта
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>2FA через SMS</Label>
                      <p className="text-sm text-muted-foreground">
                        Получайте код подтверждения по SMS
                      </p>
                    </div>
                    <Switch
                      checked={twoFactorEnabled}
                      onCheckedChange={setTwoFactorEnabled}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Тайм-аут сессии (минуты)</Label>
                    <Input
                      type="number"
                      value={sessionTimeout}
                      onChange={(e) => setSessionTimeout(Number(e.target.value))}
                      min={5}
                      max={120}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* История безопасности */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <History className="h-5 w-5 text-muted-foreground" />
                  <CardTitle>История безопасности</CardTitle>
                </div>
                <CardDescription>
                  Последние действия, связанные с безопасностью вашего аккаунта
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {securityLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between py-2 border-b">
                      <div>
                        <p className="font-medium">{log.event}</p>
                        <p className="text-sm text-muted-foreground">
                          IP: {log.ip} • {log.location}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">{log.date}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

const themes = [
  {
    value: "light",
    label: "Светлая",
    icon: <Sun className="h-6 w-6" />,
  },
  {
    value: "dark",
    label: "Тёмная",
    icon: <Moon className="h-6 w-6" />,
  },
  {
    value: "system",
    label: "Системная",
    icon: <Laptop className="h-6 w-6" />,
  },
]

const backgrounds = [
  {
    value: "gradient-1",
    preview: "bg-gradient-to-r from-primary to-primary-foreground",
  },
  {
    value: "gradient-2",
    preview: "bg-gradient-to-r from-blue-500 to-purple-500",
  },
  // ... другие варианты фона
] 