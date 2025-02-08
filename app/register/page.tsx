"use client"

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AuthBackground } from '@/components/auth/auth-background'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { signIn } from 'next-auth/react'
import { useState } from 'react'

const formSchema = z.object({
  username: z.string().min(2, {
    message: "Имя пользователя должно содержать минимум 2 символа"
  }).max(50, {
    message: "Имя пользователя не должно превышать 50 символов"
  }),
  email: z.string().email({
    message: "Введите корректный email адрес"
  }),
  password: z.string().min(8, {
    message: "Пароль должен содержать минимум 8 символов"
  }),
  confirmPassword: z.string().min(8, {
    message: "Пароль должен содержать минимум 8 символов"
  })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Пароли не совпадают",
  path: ["confirmPassword"],
})

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true)
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: values.username,
          email: values.email,
          password: values.password,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Ошибка при регистрации')
      }

      // Автоматический вход после успешной регистрации
      const result = await signIn('credentials', {
        email: values.email,
        password: values.password,
        redirect: false,
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      toast.success('Регистрация успешна!')
      router.push('/dashboard')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Произошла ошибка')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center bg-surface-light">
      {/* Фоновый компонент на весь экран */}
      <div className="absolute inset-0">
        <AuthBackground />
      </div>

      {/* Основной контейнер */}
      <div className="relative w-full max-w-[400px] p-6 z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-orange-600 to-orange-500 dark:from-orange-400 dark:to-orange-300 bg-clip-text text-transparent">
            Регистрация
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Создайте аккаунт для доступа к платформе
          </p>
        </div>

        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50/30 via-surface-medium/50 to-surface-light/20 rounded-2xl" />
          <div className="relative bg-surface-light/40 dark:bg-background/50 p-8 rounded-2xl shadow-sm border border-orange-100/10 dark:border-orange-400/10">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-orange-950 dark:text-orange-200">Имя пользователя</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Введите имя пользователя" 
                          className="border-orange-100/20 dark:border-orange-400/10 bg-white/70 dark:bg-background/50 focus:border-orange-200 dark:focus:border-orange-400/30 focus:ring-orange-200 dark:focus:ring-orange-400/30"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="text-orange-700 dark:text-orange-300" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-orange-950 dark:text-orange-200">Email</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="email@example.com" 
                          type="email" 
                          className="border-orange-100/20 dark:border-orange-400/10 bg-white/70 dark:bg-background/50 focus:border-orange-200 dark:focus:border-orange-400/30 focus:ring-orange-200 dark:focus:ring-orange-400/30"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="text-orange-700 dark:text-orange-300" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-orange-950 dark:text-orange-200">Пароль</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Введите пароль" 
                          type="password" 
                          className="border-orange-100/20 dark:border-orange-400/10 bg-white/70 dark:bg-background/50 focus:border-orange-200 dark:focus:border-orange-400/30 focus:ring-orange-200 dark:focus:ring-orange-400/30"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="text-orange-700 dark:text-orange-300" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-orange-950 dark:text-orange-200">Подтверждение пароля</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Повторите пароль" 
                          type="password" 
                          className="border-orange-100/20 dark:border-orange-400/10 bg-white/70 dark:bg-background/50 focus:border-orange-200 dark:focus:border-orange-400/30 focus:ring-orange-200 dark:focus:ring-orange-400/30"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="text-orange-700 dark:text-orange-300" />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 dark:from-orange-400 dark:to-orange-300 dark:hover:from-orange-300 dark:hover:to-orange-200 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  disabled={isLoading}
                >
                  Зарегистрироваться
                </Button>
              </form>
            </Form>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Уже есть аккаунт?{' '}
          <Link
            href="/login"
            className="font-medium text-orange-600 dark:text-orange-300 hover:underline"
          >
            Войти
          </Link>
        </p>
      </div>
    </div>
  )
} 