"use client"

import { useState, useEffect } from "react"
import { AnimatePresence } from "framer-motion"
import { useAnimation } from "@/components/providers/animation-provider"
import { 
  User, Palette, Bell, Shield, Camera, Trash2, Loader2, 
  Mail, Phone, Building2, Globe, Languages, Eye, EyeOff,
  BellRing, BellOff, Lock, Key, Smartphone, LogOut,
  Palette as ThemeIcon, Monitor, Moon, Sun, Laptop, X, Star
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
import { useUserStore } from "@/lib/store/user-store"
import { useRouter } from "next/navigation"
import { notifications } from "@/lib/notifications"
import { AvatarUpload } from "@/components/profile/avatar-upload"

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
    timezone: "Asia/Almaty",
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

interface UpdateData {
  name: string
  email: string
  phone: string
  company: string
  language: string
  timezone: string
  image?: string | null
  bio: string
  settings: {
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
  }
}

export default function SettingsPage() {
  const router = useRouter()
  const { data: sessionData, update } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [showSaveOverlay, setShowSaveOverlay] = useState(false)
  const { theme, setTheme } = useTheme()
  const settings = useSettings()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("profile")
  const [showPassword, setShowPassword] = useState(false)
  const setUserImage = useUserStore((state) => state.setUserImage)
  const { m, isReady } = useAnimation()
  
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

  // Обработчик изменения пароля
  const handlePasswordChange = async () => {
    try {
      setIsLoading(true)
      const { currentPassword, newPassword, confirmPassword } = userSettings.security

      if (newPassword !== confirmPassword) {
        notifications.error("Пароли не совпадают", {
          description: "Пожалуйста, убедитесь что новый пароль и подтверждение совпадают"
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

      if (!response.ok) {
        const data = await response.json()
        if (response.status === 401) {
          notifications.error("Неверный текущий пароль")
        } else {
          throw new Error(data.error || 'Failed to update password')
        }
        return
      }

      notifications.auth.passwordChanged()

      // Очищаем поля пароля
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
      notifications.error("Не удалось изменить пароль", {
        description: "Пожалуйста, попробуйте позже"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Updated handleSave function with proper error handling and data formatting
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    try {
      setIsLoading(true)

      // Format the data properly with type safety
      const updateData: UpdateData = {
        name: userSettings.profile.name,
        email: userSettings.profile.email,
        phone: userSettings.profile.phone,
        company: userSettings.profile.company,
        language: userSettings.profile.language,
        timezone: userSettings.profile.timezone,
        bio: userSettings.profile.bio,
        image: userSettings.profile.image,
        settings: {
          appearance: userSettings.appearance,
          notifications: userSettings.notifications
        }
      }

      // Remove null or undefined values
      const cleanedData = Object.fromEntries(
        Object.entries(updateData).filter(([_, value]) => value != null)
      ) as UpdateData

      const response = await fetch('/api/user/update', {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cleanedData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile")
      }

      // Update session data
      await update(cleanedData)

      // Show success notification
      notifications.success("Профиль обновлен", {
        description: "Изменения успешно сохранены"
      })

      // Show save overlay
      setShowSaveOverlay(true)
      
      // Hide overlay after 3 seconds
      setTimeout(() => {
        setShowSaveOverlay(false)
      }, 3000)

      // Refresh the page data
      router.refresh()

    } catch (error: unknown) {
      console.error('Update error:', error)
      notifications.error("Не удалось обновить профиль", {
        description: error instanceof Error ? error.message : "Пожалуйста, попробуйте позже"
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

      if (!response.ok) {
        const data = await response.json()
        notifications.error("Не удалось удалить аккаунт", {
          description: data.error || "Пожалуйста, попробуйте позже"
        })
        return
      }

      notifications.success("Аккаунт удален", {
        description: "Перенаправление на главную страницу..."
      })

      await signOut({ callbackUrl: '/' })
    } catch (error) {
      notifications.error("Не удалось удалить аккаунт", {
        description: "Пожалуйста, попробуйте позже"
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

  if (!isReady || !m) {
    return (
      <div className="relative min-h-screen">
        <div className="fixed inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent -z-10" />
        <div className="fixed inset-0 bg-grid-primary/10 bg-[size:16px_16px] -z-10" />
        <div className="absolute inset-0 bg-background/80 backdrop-blur-3xl -z-10" />
        <div className="container max-w-6xl py-10">
          {/* Static content */}
        </div>
      </div>
    )
  }

  const MotionDiv = m.div

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent -z-10" />
      <div className="fixed inset-0 bg-grid-primary/10 bg-[size:16px_16px] -z-10" />
      <div className="absolute inset-0 bg-background/80 backdrop-blur-3xl -z-10" />

      <div className="container max-w-6xl py-10">
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Enhanced Header with Avatar */}
          <div className="flex flex-col items-center text-center space-y-6 pb-8">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-primary/50 rounded-full opacity-75 group-hover:opacity-100 blur transition duration-1000 group-hover:duration-200" />
              <AvatarUpload
                initialImage={userSettings.profile.image}
                onImageChange={(url) => {
                  setUserSettings(prev => ({
                    ...prev,
                    profile: {
                      ...prev.profile,
                      image: url
                    }
                  }))
                }}
              />
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary/90 to-primary bg-clip-text text-transparent">
                {userSettings.profile.name || 'Настройки профиля'}
              </h1>
              <p className="text-muted-foreground">{userSettings.profile.email}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => router.push('/profile')}
              >
                <User className="w-4 h-4 mr-2" />
                Открыть профиль
              </Button>
            </div>
          </div>

          {/* Enhanced Tabs Navigation */}
          <Tabs defaultValue="profile" className="space-y-8">
            <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-14 z-10 -mx-4 px-4 pb-4 border-b">
              <TabsList className="inline-flex h-16 items-center justify-center gap-8 relative -mb-px w-full justify-start">
                <TabsTrigger 
                  value="profile" 
                  className="inline-flex items-center gap-3 px-4 py-3 relative h-16 rounded-none border-b-2 border-transparent data-[state=active]:border-primary group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 group-data-[state=active]:bg-primary/20 transition-all duration-300 group-hover:scale-110">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Профиль</span>
                      <span className="text-xs text-muted-foreground">Личная информация</span>
                    </div>
                  </div>
                </TabsTrigger>

                <TabsTrigger 
                  value="notifications"
                  className="inline-flex items-center gap-3 px-4 py-3 relative h-16 rounded-none border-b-2 border-transparent data-[state=active]:border-primary group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 group-data-[state=active]:bg-primary/20 transition-all duration-300 group-hover:scale-110">
                      <Bell className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Уведомления</span>
                      <span className="text-xs text-muted-foreground">Настройка оповещений</span>
                    </div>
                  </div>
                </TabsTrigger>

                <TabsTrigger 
                  value="appearance"
                  className="inline-flex items-center gap-3 px-4 py-3 relative h-16 rounded-none border-b-2 border-transparent data-[state=active]:border-primary group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 group-data-[state=active]:bg-primary/20 transition-all duration-300 group-hover:scale-110">
                      <Palette className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Внешний вид</span>
                      <span className="text-xs text-muted-foreground">Персонализация</span>
                    </div>
                  </div>
                </TabsTrigger>

                <TabsTrigger 
                  value="security"
                  className="inline-flex items-center gap-3 px-4 py-3 relative h-16 rounded-none border-b-2 border-transparent data-[state=active]:border-primary group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 group-data-[state=active]:bg-primary/20 transition-all duration-300 group-hover:scale-110">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Безопасность</span>
                      <span className="text-xs text-muted-foreground">Защита аккаунта</span>
                    </div>
                  </div>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Enhanced Content */}
            <div className="space-y-8">
              <TabsContent value="profile">
                <Card className="border-none shadow-xl bg-gradient-to-b from-background to-background/80">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-2xl">Профиль</CardTitle>
                    <CardDescription className="text-base">
                      Управляйте информацией вашего профиля
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    <div className="space-y-6">
                      <div className="grid gap-8 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-sm font-medium">Имя</Label>
                          <Input 
                            id="name" 
                            value={userSettings.profile.name} 
                            onChange={(e) => handleProfileChange('name', e.target.value)} 
                            placeholder="Ваше имя"
                            className="h-12 text-base"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                          <Input 
                            id="email" 
                            type="email" 
                            value={userSettings.profile.email} 
                            onChange={(e) => handleProfileChange('email', e.target.value)} 
                            placeholder="your@email.com"
                            className="h-12 text-base"
                          />
                        </div>
                      </div>

                      <div className="grid gap-8 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="phone" className="text-sm font-medium">Телефон</Label>
                          <Input 
                            id="phone" 
                            value={userSettings.profile.phone} 
                            onChange={(e) => handleProfileChange('phone', e.target.value)} 
                            placeholder="+7 (XXX) XXX-XXXX"
                            className="h-12 text-base"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="company" className="text-sm font-medium">Компания</Label>
                          <Input 
                            id="company" 
                            value={userSettings.profile.company} 
                            onChange={(e) => handleProfileChange('company', e.target.value)} 
                            placeholder="Название компании"
                            className="h-12 text-base"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bio" className="text-sm font-medium">О себе</Label>
                        <textarea
                          id="bio"
                          value={userSettings.profile.bio}
                          onChange={(e) => handleProfileChange('bio', e.target.value)}
                          className="w-full min-h-[120px] rounded-lg border border-input bg-background px-4 py-3 text-base resize-none focus:ring-2 focus:ring-primary/10 transition-all"
                          placeholder="Расскажите о себе..."
                        />
                      </div>
                    </div>

                    <Separator className="my-6" />

                    <div className="flex justify-end gap-4">
                      <Button 
                        variant="outline" 
                        onClick={() => handleSave()} 
                        disabled={isLoading}
                        className="min-w-[160px] h-11"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Сохранение...
                          </>
                        ) : (
                          'Сохранить изменения'
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="notifications">
                <Card className="border-none shadow-xl bg-gradient-to-b from-background to-background/80">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-2xl">Уведомления</CardTitle>
                    <CardDescription className="text-base">
                      Настройте параметры уведомлений
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-8">
                      <div className="grid gap-6">
                        <div className="flex items-center justify-between space-x-4 rounded-xl border p-6 hover:bg-accent/50 transition-colors">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <div className="p-2 rounded-lg bg-primary/10">
                                <BellRing className="h-5 w-5 text-primary" />
                              </div>
                              <Label className="text-lg font-medium">Уведомления о курсах</Label>
                            </div>
                            <p className="text-sm text-muted-foreground max-w-md">
                              Получайте уведомления о новых курсах, обновлениях и важных событиях
                            </p>
                          </div>
                          <Switch 
                            checked={userSettings.notifications?.courses} 
                            onCheckedChange={(checked) => handleNotificationsChange('courses', checked)}
                            className="data-[state=checked]:bg-primary scale-125"
                          />
                        </div>

                        <div className="flex items-center justify-between space-x-4 rounded-xl border p-6 hover:bg-accent/50 transition-colors">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <div className="p-2 rounded-lg bg-primary/10">
                                <Mail className="h-5 w-5 text-primary" />
                              </div>
                              <Label className="text-lg font-medium">Сообщения</Label>
                            </div>
                            <p className="text-sm text-muted-foreground max-w-md">
                              Получайте уведомления о новых сообщениях и ответах
                            </p>
                          </div>
                          <Switch 
                            checked={userSettings.notifications?.messages} 
                            onCheckedChange={(checked) => handleNotificationsChange('messages', checked)}
                            className="data-[state=checked]:bg-primary scale-125"
                          />
                        </div>

                        <div className="flex items-center justify-between space-x-4 rounded-xl border p-6 hover:bg-accent/50 transition-colors">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <div className="p-2 rounded-lg bg-primary/10">
                                <Star className="h-5 w-5 text-primary" />
                              </div>
                              <Label className="text-lg font-medium">Достижения</Label>
                            </div>
                            <p className="text-sm text-muted-foreground max-w-md">
                              Получайте уведомления о новых достижениях и наградах
                            </p>
                          </div>
                          <Switch 
                            checked={userSettings.notifications?.achievements} 
                            onCheckedChange={(checked) => handleNotificationsChange('achievements', checked)}
                            className="data-[state=checked]:bg-primary scale-125"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="appearance">
                <Card className="border-none shadow-xl bg-gradient-to-b from-background to-background/80">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-2xl">Внешний вид</CardTitle>
                    <CardDescription className="text-base">
                      Настройте внешний вид приложения
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-8">
                      <div className="space-y-4">
                        <Label className="text-lg font-medium">Тема оформления</Label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <Button
                            variant={theme === 'light' ? 'default' : 'outline'}
                            onClick={() => setTheme('light')}
                            className={cn(
                              "h-32 w-full relative overflow-hidden rounded-xl",
                              "flex flex-col items-center justify-center gap-3",
                              theme === 'light' && "ring-2 ring-primary",
                              "hover:ring-2 hover:ring-primary/50 transition-all duration-300"
                            )}
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-orange-100/50 opacity-50" />
                            <Sun className="h-8 w-8 text-orange-600" />
                            <span className="font-medium relative z-10 text-lg">Светлая тема</span>
                          </Button>

                          <Button
                            variant={theme === 'dark' ? 'default' : 'outline'}
                            onClick={() => setTheme('dark')}
                            className={cn(
                              "h-32 w-full relative overflow-hidden rounded-xl",
                              "flex flex-col items-center justify-center gap-3",
                              theme === 'dark' && "ring-2 ring-primary",
                              "hover:ring-2 hover:ring-primary/50 transition-all duration-300"
                            )}
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800 opacity-50" />
                            <Moon className="h-8 w-8 text-slate-400" />
                            <span className="font-medium relative z-10 text-lg">Темная тема</span>
                          </Button>

                          <Button
                            variant={theme === 'system' ? 'default' : 'outline'}
                            onClick={() => setTheme('system')}
                            className={cn(
                              "h-32 w-full relative overflow-hidden rounded-xl",
                              "flex flex-col items-center justify-center gap-3",
                              theme === 'system' && "ring-2 ring-primary",
                              "hover:ring-2 hover:ring-primary/50 transition-all duration-300"
                            )}
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100/50 opacity-50" />
                            <Laptop className="h-8 w-8 text-blue-600" />
                            <span className="font-medium relative z-10 text-lg">Системная тема</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="security">
                <div className="grid gap-8">
                  {/* Password Change Card */}
                  <Card className="border-none shadow-xl bg-gradient-to-b from-background to-background/80">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-2xl">Изменить пароль</CardTitle>
                      <CardDescription className="text-base">
                        Обновите пароль для защиты вашего аккаунта
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="currentPassword" className="text-sm font-medium">
                            Текущий пароль
                          </Label>
                          <div className="relative">
                            <Input
                              id="currentPassword"
                              type={showPassword ? "text" : "password"}
                              value={userSettings.security?.currentPassword || ''}
                              onChange={(e) => handleSecurityChange('currentPassword', e.target.value)}
                              className="h-12 text-base pr-12"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-12 w-12"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-5 w-5 text-muted-foreground" />
                              ) : (
                                <Eye className="h-5 w-5 text-muted-foreground" />
                              )}
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="newPassword" className="text-sm font-medium">
                            Новый пароль
                          </Label>
                          <div className="relative">
                            <Input
                              id="newPassword"
                              type={showPassword ? "text" : "password"}
                              value={userSettings.security?.newPassword || ''}
                              onChange={(e) => handleSecurityChange('newPassword', e.target.value)}
                              className="h-12 text-base pr-12"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-12 w-12"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-5 w-5 text-muted-foreground" />
                              ) : (
                                <Eye className="h-5 w-5 text-muted-foreground" />
                              )}
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword" className="text-sm font-medium">
                            Подтвердите новый пароль
                          </Label>
                          <div className="relative">
                            <Input
                              id="confirmPassword"
                              type={showPassword ? "text" : "password"}
                              value={userSettings.security?.confirmPassword || ''}
                              onChange={(e) => handleSecurityChange('confirmPassword', e.target.value)}
                              className="h-12 text-base pr-12"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-12 w-12"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-5 w-5 text-muted-foreground" />
                              ) : (
                                <Eye className="h-5 w-5 text-muted-foreground" />
                              )}
                            </Button>
                          </div>
                        </div>

                        <Button 
                          onClick={handlePasswordChange} 
                          disabled={isLoading}
                          className="w-full h-12 text-base mt-2"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              Изменение пароля...
                            </>
                          ) : (
                            'Изменить пароль'
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Danger Zone Card */}
                  <Card className="border-none shadow-xl bg-red-50/50 dark:bg-red-900/5">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-2xl text-red-600 dark:text-red-500">Опасная зона</CardTitle>
                      <CardDescription className="text-base">
                        Необратимые действия с вашим аккаунтом
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="destructive" 
                            className="w-full h-12 text-base bg-red-500 hover:bg-red-600"
                          >
                            <Trash2 className="mr-2 h-5 w-5" />
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
                              className="bg-red-500 text-white hover:bg-red-600"
                            >
                              {isLoading ? (
                                <>
                                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                  Удаление...
                                </>
                              ) : (
                                'Удалить'
                              )}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </MotionDiv>
      </div>

      <AnimatePresence>
        {showSaveOverlay && (
          <MotionDiv
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-4 right-4 z-50"
          >
            <div className="bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-100 px-6 py-4 rounded-xl shadow-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <p className="font-medium text-base">Изменения успешно сохранены</p>
                <Button
                  size="sm"
                  variant="ghost"
                  className="ml-4 text-green-900 dark:text-green-100 hover:text-green-900/80 dark:hover:text-green-100/80"
                  onClick={() => setShowSaveOverlay(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </MotionDiv>
        )}
      </AnimatePresence>
    </div>
  )
}