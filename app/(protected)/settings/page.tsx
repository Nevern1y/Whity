"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
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

interface UserSettings {
  profile: {
    name: string
    email: string
    phone: string
    company: string
    language: string
    timezone: string
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
  }
}

const defaultSettings: UserSettings = {
  profile: {
    name: "",
    email: "",
    phone: "",
    company: "",
    language: "ru",
    timezone: "Europe/Moscow"
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
    newsletter: false
  },
  security: {
    twoFactor: false,
    sessionTimeout: 30,
    activeDevices: []
  }
}

export default function SettingsPage() {
  const { data: sessionData } = useSession()
  const settings = useSettings()
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("profile")
  const [showPassword, setShowPassword] = useState(false)
  
  // Используем значения по умолчанию
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

  // Функция сохранения настроек
  const handleSave = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userSettings),
      })

      if (response.ok) {
        toast({
          title: "Успех",
          description: "Настройки успешно сохранены",
        })
      } else {
        throw new Error('Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить настройки",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Обработчики изменений
  const handleProfileChange = (field: keyof UserSettings['profile'], value: string) => {
    setUserSettings(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        [field]: value
      }
    }))
  }

  const handleAppearanceChange = (field: keyof UserSettings['appearance'], value: any) => {
    setUserSettings(prev => ({
      ...prev,
      appearance: {
        ...prev.appearance,
        [field]: value
      }
    }))
  }

  const handleNotificationsChange = (field: keyof UserSettings['notifications'], value: boolean) => {
    setUserSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: value
      }
    }))
  }

  const handleSecurityChange = (field: keyof UserSettings['security'], value: any) => {
    setUserSettings(prev => ({
      ...prev,
      security: {
        ...prev.security,
        [field]: value
      }
    }))
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Ошибка",
          description: "Размер файла не должен превышать 5MB",
          variant: "destructive",
        })
        return
      }
      try {
        setIsLoading(true)
        const reader = new FileReader()
        reader.onloadend = () => {
          setProfileImage(reader.result as string)
          toast({
            title: "Фото загружено",
            description: "Изображение профиля обновлено"
          })
        }
        reader.readAsDataURL(file)
      } catch (error) {
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить изображение",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
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
    <>
      <DecorativeBackground />
      <motion.div 
        className="container max-w-5xl py-6 px-4 md:px-6 space-y-8 relative"
        initial="hidden"
        animate="show"
        variants={containerAnimation}
      >
        {/* Заголовок с декоративным элементом */}
        <motion.div 
          className="space-y-2 relative"
          variants={itemAnimation}
        >
          <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-primary to-secondary rounded-full" />
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight pl-4">
            Настройки
          </h1>
          <p className="text-sm md:text-base text-muted-foreground pl-4">
            Управляйте настройками вашего аккаунта и предпочтениями
          </p>
        </motion.div>

        {/* Основной контент */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Навигация */}
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pb-4">
            <TabsList className="w-full max-w-[600px] h-auto flex flex-wrap gap-2 md:grid md:grid-cols-4">
              {[
                { value: "profile", icon: User, label: "Профиль" },
                { value: "appearance", icon: ThemeIcon, label: "Вид" },
                { value: "notifications", icon: Bell, label: "Уведомления" },
                { value: "security", icon: Shield, label: "Безопасность" },
              ].map(({ value, icon: Icon, label }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 md:py-2.5",
                    "transition-all duration-200",
                    "data-[state=active]:bg-primary/10 data-[state=active]:text-primary",
                    "hover:bg-muted/60"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="inline">{label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Контент табов */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* Профиль */}
            <TabsContent value="profile" className="space-y-4 mt-0">
              <EnhancedCard
                title="Личная информация"
                description="Управляйте вашей личной информацией и настройками профиля"
                icon={<User className="h-5 w-5" />}
              >
                <CardContent className="space-y-6">
                  {/* Фото профиля */}
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    <div className="relative group">
                      <Avatar className="h-24 w-24 ring-2 ring-offset-2 ring-offset-background ring-primary/20">
                        <AvatarImage src={profileImage || ""} />
                        <AvatarFallback>
                          {userSettings.profile.name 
                            ? userSettings.profile.name.charAt(0).toUpperCase()
                            : "U"
                          }
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Label htmlFor="picture" className="cursor-pointer text-white text-xs">
                          Изменить
                        </Label>
                        <Input
                          id="picture"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-2"
                          disabled={isLoading}
                        >
                          <Camera className="h-4 w-4" />
                          <Label htmlFor="picture" className="cursor-pointer">
                            Загрузить фото
                          </Label>
                        </Button>
                        {profileImage && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="gap-2 text-destructive hover:text-destructive"
                            onClick={() => setProfileImage(null)}
                            disabled={isLoading}
                          >
                            <Trash2 className="h-4 w-4" />
                            Удалить
                          </Button>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Рекомендуемый размер: 200x200px. Максимальный размер: 5MB.
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* Основная информация */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Имя
                      </Label>
                      <Input 
                        id="name"
                        value={userSettings.profile.name}
                        onChange={(e) => handleProfileChange('name', e.target.value)}
                        placeholder="Ваше имя"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email
                      </Label>
                      <Input 
                        id="email"
                        type="email"
                        value={userSettings.profile.email}
                        onChange={(e) => handleProfileChange('email', e.target.value)}
                        placeholder="your@email.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Телефон
                      </Label>
                      <Input 
                        id="phone"
                        value={userSettings.profile.phone}
                        onChange={(e) => handleProfileChange('phone', e.target.value)}
                        placeholder="+7 (XXX) XXX-XXXX"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company" className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Компания
                      </Label>
                      <Input 
                        id="company"
                        value={userSettings.profile.company}
                        onChange={(e) => handleProfileChange('company', e.target.value)}
                        placeholder="Название компании"
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Региональные настройки */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Часовой пояс
                      </Label>
                      <Select 
                        value={userSettings.profile.timezone}
                        onValueChange={(value: string) => handleProfileChange('timezone', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите часовой пояс" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Europe/Moscow">Москва (UTC+3)</SelectItem>
                          <SelectItem value="Europe/London">Лондон (UTC+0)</SelectItem>
                          <SelectItem value="America/New_York">Нью-Йорк (UTC-5)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Languages className="h-4 w-4" />
                        Язык интерфейса
                      </Label>
                      <Select
                        value={userSettings.profile.language}
                        onValueChange={(value: string) => 
                          handleProfileChange('language', value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите язык" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ru">Русский</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="de">Deutsch</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </EnhancedCard>

              {/* Кнопка сохранения */}
              <div className="flex justify-end">
                <Button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="relative overflow-hidden group"
                >
                  {isLoading && (
                    <Loader2 className="h-4 w-4 animate-spin absolute left-3" />
                  )}
                  <span className={cn(isLoading && "pl-7")}>
                    {isLoading ? "Сохранение..." : "Сохранить изменения"}
                  </span>
                </Button>
              </div>
            </TabsContent>

            {/* Внешний вид */}
            <TabsContent value="appearance" className="space-y-4">
              <EnhancedCard
                title="Настройки интерфейса"
                description="Настройте внешний вид приложения под свои предпочтения"
                icon={<ThemeIcon className="h-5 w-5" />}
              >
                <CardContent className="space-y-6">
                  {/* Тема */}
                  <div className="space-y-4">
                    <Label>Тема оформления</Label>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { value: 'light', label: 'Светлая', icon: Sun },
                        { value: 'dark', label: 'Темная', icon: Moon },
                        { value: 'system', label: 'Системная', icon: Laptop }
                      ].map(({ value, label, icon: Icon }) => (
                        <Button
                          key={value}
                          variant={theme === value ? "default" : "outline"}
                          className="flex flex-col items-center gap-2 h-auto p-4"
                          onClick={() => setTheme(value)}
                        >
                          <Icon className="h-5 w-5" />
                          <span>{label}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Другие настройки внешнего вида */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Анимации интерфейса</Label>
                        <p className="text-sm text-muted-foreground">
                          Включить/выключить анимации в интерфейсе
                        </p>
                      </div>
                      <Switch
                        checked={userSettings.appearance.animations}
                        onCheckedChange={(checked: boolean) => 
                          handleAppearanceChange('animations', checked)
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Уменьшенное движение</Label>
                        <p className="text-sm text-muted-foreground">
                          Минимизировать анимации для доступности
                        </p>
                      </div>
                      <Switch
                        checked={userSettings.appearance.reducedMotion}
                        onCheckedChange={(checked: boolean) => 
                          handleAppearanceChange('reducedMotion', checked)
                        }
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Размер шрифта */}
                  <div className="space-y-4">
                    <Label>Размер шрифта</Label>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { value: 'sm', label: 'Маленький' },
                        { value: 'md', label: 'Средний' },
                        { value: 'lg', label: 'Большой' }
                      ].map(({ value, label }) => (
                        <Button
                          key={value}
                          variant={userSettings.appearance.fontSize === value ? "default" : "outline"}
                          onClick={() => handleAppearanceChange('fontSize', value)}
                        >
                          {label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </EnhancedCard>
            </TabsContent>

            {/* Уведомления */}
            <TabsContent value="notifications" className="space-y-4">
              <EnhancedCard
                title="Настройки уведомлений"
                description="Настройте способы получения уведомлений и их типы"
                icon={<BellRing className="h-5 w-5" />}
              >
                <CardContent className="space-y-6">
                  {/* Каналы уведомлений */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Каналы уведомлений</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Email уведомления</Label>
                          <p className="text-sm text-muted-foreground">
                            Получать уведомления на email
                          </p>
                        </div>
                        <Switch
                          checked={userSettings.notifications.email}
                          onCheckedChange={(checked: boolean) => 
                            handleNotificationsChange('email', checked)
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Push-уведомления</Label>
                          <p className="text-sm text-muted-foreground">
                            Получать уведомления в браузере
                          </p>
                        </div>
                        <Switch
                          checked={userSettings.notifications.push}
                          onCheckedChange={(checked: boolean) => 
                            handleNotificationsChange('push', checked)
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Типы уведомлений */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Типы уведомлений</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Звуковые уведомления</Label>
                          <p className="text-sm text-muted-foreground">
                            Проигрывать звук при уведомлениях
                          </p>
                        </div>
                        <Switch
                          checked={userSettings.notifications.sounds}
                          onCheckedChange={(checked: boolean) => 
                            handleNotificationsChange('sounds', checked)
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Обновления системы</Label>
                          <p className="text-sm text-muted-foreground">
                            Уведомления об обновлениях системы
                          </p>
                        </div>
                        <Switch
                          checked={userSettings.notifications.updates}
                          onCheckedChange={(checked: boolean) => 
                            handleNotificationsChange('updates', checked)
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Новостная рассылка</Label>
                          <p className="text-sm text-muted-foreground">
                            Получать новости и обновления по email
                          </p>
                        </div>
                        <Switch
                          checked={userSettings.notifications.newsletter}
                          onCheckedChange={(checked: boolean) => 
                            handleNotificationsChange('newsletter', checked)
                          }
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </EnhancedCard>
            </TabsContent>

            {/* Безопасность */}
            <TabsContent value="security" className="space-y-4">
              <EnhancedCard
                title="Безопасность"
                description="Управляйте настройками безопасности вашего аккаунта"
                icon={<Lock className="h-5 w-5" />}
              >
                <CardContent className="space-y-6">
                  {/* Двухфакторная аутентификация */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="flex items-center gap-2">
                        <Key className="h-4 w-4" />
                        Двухфакторная аутентификация
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Дополнительный уровень защиты для вашего аккаунта
                      </p>
                    </div>
                    <Switch
                      checked={userSettings.security.twoFactor}
                      onCheckedChange={(checked: boolean) => 
                        handleSecurityChange('twoFactor', checked)
                      }
                    />
                  </div>

                  <Separator />

                  {/* Смена пароля */}
                  <div className="space-y-4">
                    <Label className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Сменить пароль
                    </Label>
                    <div className="space-y-2">
                      <div className="relative">
                        <Input 
                          type={showPassword ? "text" : "password"} 
                          placeholder="Текущий пароль"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <Input type="password" placeholder="Новый пароль" />
                      <Input type="password" placeholder="Подтвердите новый пароль" />
                    </div>
                  </div>

                  <Separator />

                  {/* Активные сессии */}
                  <div className="space-y-4">
                    <Label className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      Активные устройства
                    </Label>
                    <div className="space-y-4">
                      {sessionsLoading ? (
                        <div className="flex items-center justify-center p-4">
                          <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                      ) : sessions && sessions.length > 0 ? (
                        sessions.map((device: SessionInfo) => (
                          <div 
                            key={device.id}
                            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                          >
                            <div className="space-y-1">
                              <p className="font-medium">{device.device.name}</p>
                              <p className="text-sm text-muted-foreground">
                                Последняя активность: {new Date(device.lastActive).toLocaleString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {device.current && (
                                <Badge variant="outline">Текущее устройство</Badge>
                              )}
                              {!device.current && (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => terminateSession(device.id)}
                                >
                                  Завершить сессию
                                </Button>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-muted-foreground py-4">
                          Нет активных сессий
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Удаление аккаунта */}
                  <div className="space-y-4">
                    <Label className="text-destructive">Опасная зона</Label>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full sm:w-auto">
                          Удалить аккаунт
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Вы уверены, что хотите удалить аккаунт?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Это действие необратимо. Все ваши данные будут удалены без возможности восстановления.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Отмена</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => signOut()}
                          >
                            Удалить
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </EnhancedCard>
            </TabsContent>
          </motion.div>
        </Tabs>
      </motion.div>
    </>
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