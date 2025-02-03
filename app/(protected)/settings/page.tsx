"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  User, Palette, Bell, Shield, Camera, Trash2, Loader2, 
  Mail, Phone, Building2, Globe, Languages, Eye, EyeOff,
  BellRing, BellOff, Lock, Key, Smartphone, LogOut,
  Palette as ThemeIcon, Monitor, Moon, Sun, Laptop
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTheme } from "next-themes"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { signOut } from "next-auth/react"
import { useSettings } from "@/hooks/use-settings"
import { useSessions } from "@/hooks/use-sessions"
import { pusherClient } from "@/lib/pusher"
import { useSession } from 'next-auth/react'
import type { SessionInfo } from '@/types/session'
import { DecorativeBackground } from "@/components/ui/decorative-background"
import { EnhancedCard } from "@/components/ui/enhanced-card"
import { AvatarUpload } from "@/components/profile/avatar-upload"
import { useUserStore } from "@/lib/store/user-store"
import { useRouter } from "next/navigation"
import { ImageCropDialog } from "@/components/image-crop-dialog"

interface UserSettings {
  profile: {
    name: string
    email: string
    phone: string
    company: string
    language: string
    timezone: string
    image?: string | null
    bio: string
  }
  appearance: {
    theme: 'light' | 'dark' | 'system'
    animations: boolean
    reducedMotion: boolean
    fontSize: 'sm' | 'md' | 'lg'
  }
  notifications: {
    email: boolean
    push: boolean
    sounds: boolean
    updates: boolean
    newsletter: boolean
    courses: boolean
    messages: boolean
    achievements: boolean
  }
  security: {
    twoFactor: boolean
    sessionTimeout: number
    activeDevices: {
      id: string
      name: string
      lastActive: string
      current: boolean
    }[]
    currentPassword: string
    newPassword: string
    confirmPassword: string
  }
}

const defaultSettings: UserSettings = {
  profile: {
    name: "",
    email: "",
    phone: "",
    company: "",
    language: "ru",
    timezone: "Europe/Moscow",
    image: null,
    bio: ""
  },
  appearance: {
    theme: 'system',
    animations: true,
    reducedMotion: false,
    fontSize: 'md'
  },
  notifications: {
    email: true,
    push: false,
    sounds: true,
    updates: true,
    newsletter: false,
    courses: true,
    messages: true,
    achievements: true
  },
  security: {
    twoFactor: false,
    sessionTimeout: 30,
    activeDevices: [],
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
}

export default function SettingsPage() {
  const router = useRouter()
  const { data: sessionData, update } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [showSaveOverlay, setShowSaveOverlay] = useState(false)
  const [cropDialogOpen, setCropDialogOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const { theme, setTheme } = useTheme()
  const settings = useSettings()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("profile")
  const [showPassword, setShowPassword] = useState(false)
  const setUserImage = useUserStore((state) => state.setUserImage)
  
  // Состояние настроек пользователя
  const [userSettings, setUserSettings] = useState<UserSettings>(defaultSettings)

  const { sessions = [], isLoading: sessionsLoading, terminateSession } = useSessions()
  
  // Загрузка настроек при монтировании
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/settings')
        if (response.ok) {
          const data = await response.json()
          // Объединяем полученные данные с дефолтными значениями
          setUserSettings(prev => ({
            ...prev,
            ...data,
            profile: {
              ...prev.profile,
              ...data.profile
            },
            appearance: {
              ...prev.appearance,
              ...data.appearance
            },
            notifications: {
              ...prev.notifications,
              ...data.notifications
            },
            security: {
              ...prev.security,
              ...data.security
            }
          }))
        }
      } catch (error) {
        console.error('Failed to load settings:', error)
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить настройки",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (sessionData?.user?.id) {
      loadSettings()
    }
  }, [sessionData?.user?.id, toast])

  // Обработчики изменения профиля
  const handleProfileChange = (field: string, value: string) => {
    setUserSettings(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        [field]: value
      }
    }))
  }

  // Обработчик изменения уведомлений
  const handleNotificationsChange = (key: string, value: boolean) => {
    setUserSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }))
  }

  // Обработчик изменения настроек безопасности
  const handleSecurityChange = (key: string, value: string) => {
    setUserSettings(prev => ({
      ...prev,
      security: {
        ...prev.security,
        [key]: value
      }
    }))
  }

  // Обработчик выбора изображения
  const handleImageSelect = (image: string) => {
    setSelectedImage(image)
    setCropDialogOpen(true)
  }

  // Обработчик изменения пароля
  const handlePasswordChange = async () => {
    try {
      setIsLoading(true)
      const { currentPassword, newPassword, confirmPassword } = userSettings.security

      if (newPassword !== confirmPassword) {
        toast({
          title: "Ошибка",
          description: "Пароли не совпадают",
          variant: "destructive"
        })
        return
      }

      const response = await fetch('/api/settings/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      })

      if (!response.ok) throw new Error('Failed to update password')

      toast({
        title: "Успех",
        description: "Пароль успешно изменен"
      })

      // Очищаем поля пароля, сохраняя остальные настройки безопасности
      setUserSettings(prev => ({
        ...prev,
        security: {
          ...prev.security,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }
      }))
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось изменить пароль",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Обработчик сохранения настроек
  const handleSaveSettings = async () => {
    setIsLoading(true)
    try {
      // Предположим, что обновляются только настройки профиля.
      const response = await fetch('/api/user/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify((() => {
          const payload = { ...userSettings.profile }
          if (payload.image === null) {
            delete payload.image
          }
          return payload
        })())
      })
      const data = await response.json()
      if (response.ok && data.success) {
        toast({
          title: "Сохранения применены",
          description: "Ваши настройки успешно обновлены."
        })
      } else {
        toast({
          title: "Ошибка",
          description: data.error || "Не удалось сохранить настройки",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить настройки",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Обработчик удаления аккаунта
  const handleDeleteAccount = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/user', {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete account')

      await signOut({ callbackUrl: '/' })
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить аккаунт",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Обработчик сохранения изменений
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsLoading(true)

      const response = await fetch('/api/user/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userSettings.profile)
      })

      if (!response.ok) throw new Error('Failed to update profile')

      await update(userSettings.profile)
      // Вместо стандартного toast вызываем оверлей
      setShowSaveOverlay(true)
      // Через 3 секунды прячем оверлей и обновляем страницу
      setTimeout(() => {
        setShowSaveOverlay(false)
        router.refresh()
      }, 3000)
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить профиль",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageChange = async (url: string) => {
    try {
      setIsLoading(true)
      
      const response = await fetch('/api/user/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: url })
      })

      if (!response.ok) throw new Error('Failed to update profile')

      setUserImage(url)
      await update({ image: url })
      
      router.refresh()
      toast({
        title: "Успех",
        description: "Фото профиля обновлено"
      })
      setCropDialogOpen(false)
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить фото профиля",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Анимации
  const containerAnimation = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, staggerChildren: 0.1 }
    }
  }

  const itemAnimation = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div className="container py-8 animate-fade-in">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Настройки</h1>
          <p className="text-muted-foreground">
            Управляйте своим аккаунтом и настройками приложения
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-8">
          {/* Навигация сверху */}
          <div className="border-b">
            <TabsList className="inline-flex h-14 items-center justify-center gap-6 relative -mb-px">
              <TabsTrigger 
                value="profile" 
                className="inline-flex items-center gap-2 px-4 py-3 relative h-14 rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-md bg-primary/10">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-medium">Профиль</span>
                </div>
              </TabsTrigger>

              <TabsTrigger 
                value="notifications"
                className="inline-flex items-center gap-2 px-4 py-3 relative h-14 rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-md bg-primary/10">
                    <Bell className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-medium">Уведомления</span>
                </div>
              </TabsTrigger>

              <TabsTrigger 
                value="appearance"
                className="inline-flex items-center gap-2 px-4 py-3 relative h-14 rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-md bg-primary/10">
                    <Palette className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-medium">Внешний вид</span>
                </div>
              </TabsTrigger>

              <TabsTrigger 
                value="security"
                className="inline-flex items-center gap-2 px-4 py-3 relative h-14 rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-md bg-primary/10">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-medium">Безопасность</span>
                </div>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Контент */}
          <div>
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Профиль</CardTitle>
                  <CardDescription>
                    Управляйте информацией вашего профиля
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-full overflow-hidden bg-muted">
                          <AvatarUpload
                            initialImage={sessionData?.user?.image}
                            onImageChange={handleImageSelect}
                          />
                        </div>
                        <Button
                          size="icon"
                          variant="outline"
                          className="absolute -bottom-2 -right-2 rounded-full"
                        >
                          <Camera className="w-4 h-4" />
                        </Button>
                      </div>
                      <div>
                        <h3 className="font-medium">Фото профиля</h3>
                        <p className="text-sm text-muted-foreground">
                          Рекомендуемый размер: 400x400px
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Имя</Label>
                        <Input id="name" value={userSettings.profile.name} onChange={(e) => handleProfileChange('name', e.target.value)} placeholder="Ваше имя" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={userSettings.profile.email} onChange={(e) => handleProfileChange('email', e.target.value)} placeholder="your@email.com" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Телефон</Label>
                      <Input id="phone" value={userSettings.profile.phone} onChange={(e) => handleProfileChange('phone', e.target.value)} placeholder="+7 (XXX) XXX-XXXX" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company">Компания</Label>
                      <Input id="company" value={userSettings.profile.company} onChange={(e) => handleProfileChange('company', e.target.value)} placeholder="Название компании" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">О себе</Label>
                      <textarea
                        id="bio"
                        value={userSettings.profile.bio}
                        onChange={(e) => handleProfileChange('bio', e.target.value)}
                        className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                        placeholder="Расскажите о себе..."
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-end gap-4">
                    <Button variant="outline" onClick={handleSave} disabled={isLoading}>Сохранить изменения</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Уведомления</CardTitle>
                  <CardDescription>
                    Настройте параметры уведомлений
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Уведомления о курсах</Label>
                        <p className="text-sm text-muted-foreground">
                          Получать уведомления о новых курсах и обновлениях
                        </p>
                      </div>
                      <Switch checked={userSettings.notifications?.courses} 
                             onCheckedChange={(checked) => 
                               handleNotificationsChange('courses', checked)
                             } />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Сообщения</Label>
                        <p className="text-sm text-muted-foreground">
                          Получать уведомления о новых сообщениях
                        </p>
                      </div>
                      <Switch checked={userSettings.notifications?.messages} 
                             onCheckedChange={(checked) => 
                               handleNotificationsChange('messages', checked)
                             } />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Достижения</Label>
                        <p className="text-sm text-muted-foreground">
                          Получать уведомления о новых достижениях
                        </p>
                      </div>
                      <Switch checked={userSettings.notifications?.achievements} 
                             onCheckedChange={(checked) => 
                               handleNotificationsChange('achievements', checked)
                             } />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="appearance">
              <Card>
                <CardHeader>
                  <CardTitle>Внешний вид</CardTitle>
                  <CardDescription>
                    Настройте внешний вид приложения
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Тема</Label>
                      <div className="grid grid-cols-3 gap-4">
                        <Button
                          variant={theme === 'light' ? 'default' : 'outline'}
                          className="w-full justify-start gap-2"
                          onClick={() => setTheme('light')}
                        >
                          <Sun className="w-4 h-4" />
                          Светлая
                        </Button>
                        <Button
                          variant={theme === 'dark' ? 'default' : 'outline'}
                          className="w-full justify-start gap-2"
                          onClick={() => setTheme('dark')}
                        >
                          <Moon className="w-4 h-4" />
                          Темная
                        </Button>
                        <Button
                          variant={theme === 'system' ? 'default' : 'outline'}
                          className="w-full justify-start gap-2"
                          onClick={() => setTheme('system')}
                        >
                          <Laptop className="w-4 h-4" />
                          Системная
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Безопасность</CardTitle>
                  <CardDescription>
                    Управляйте параметрами безопасности
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Изменить пароль</Label>
                      <div className="grid gap-4">
                        <Input
                          type="password"
                          placeholder="Текущий пароль"
                          value={userSettings.security?.currentPassword || ''}
                          onChange={(e) => handleSecurityChange('currentPassword', e.target.value)}
                        />
                        <Input
                          type="password"
                          placeholder="Новый пароль"
                          value={userSettings.security?.newPassword || ''}
                          onChange={(e) => handleSecurityChange('newPassword', e.target.value)}
                        />
                        <Input
                          type="password"
                          placeholder="Подтвердите новый пароль"
                          value={userSettings.security?.confirmPassword || ''}
                          onChange={(e) => handleSecurityChange('confirmPassword', e.target.value)}
                        />
                        <Button onClick={handlePasswordChange} disabled={isLoading}>
                          Изменить пароль
                        </Button>
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <Label className="text-destructive">Опасная зона</Label>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" className="w-full">
                            Удалить аккаунт
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Это действие нельзя отменить. Все ваши данные будут удалены.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Отмена</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleDeleteAccount}
                              className="bg-destructive text-destructive-foreground"
                            >
                              Удалить
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </motion.div>

      <ImageCropDialog
        isOpen={cropDialogOpen}
        onClose={() => setCropDialogOpen(false)}
        imageSrc={selectedImage || ''}
        onCropComplete={handleImageChange}
      />

      <AnimatePresence>
        {showSaveOverlay && (
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.95 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="fixed top-20 right-5 z-50"
          >
            <div className="p-5 rounded-xl shadow-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-extrabold">Изменения сохранены</h2>
                  <p className="mt-2 text-base">Ваш профиль обновлен</p>
                </div>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => setShowSaveOverlay(false)}
                  className="ml-4"
                >
                  Закрыть
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Вспомогательные компоненты
function SettingHint({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md bg-muted/50 p-4">
      <div className="flex items-start gap-4">
        <div className="rounded-full bg-primary/10 p-2">
          <BellRing className="h-4 w-4 text-primary" />
        </div>
        <div className="text-sm text-muted-foreground">
          {children}
        </div>
      </div>
    </div>
  )
}

function SettingStatus({ enabled }: { enabled: boolean }) {
  return (
    <Badge variant={enabled ? "default" : "secondary"}>
      {enabled ? "Включено" : "Выключено"}
    </Badge>
  )
}