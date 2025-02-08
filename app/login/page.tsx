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
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { ClientOnly } from '@/components/client-only'

const formSchema = z.object({
  email: z.string().email('Введите корректный email'),
  password: z.string().min(6, 'Минимум 6 символов'),
})

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const callbackUrl = searchParams?.get('callbackUrl') || '/dashboard'

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true)
      const result = await signIn('credentials', {
        ...values,
        redirect: false,
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      toast.success('Вход выполнен успешно')
      router.push(callbackUrl)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Ошибка входа')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input 
                  placeholder="email@example.com" 
                  type="email" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Пароль</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Введите пароль" 
                  type="password" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button 
          type="submit" 
          className="w-full"
          disabled={isLoading}
        >
          Войти
        </Button>
      </form>
    </Form>
  )
}

export default function LoginPage() {
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
            Вход в систему
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Войдите в свой аккаунт
          </p>
        </div>

        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50/30 via-surface-medium/50 to-surface-light/20 rounded-2xl" />
          <div className="relative bg-surface-light/40 dark:bg-background/50 p-8 rounded-2xl shadow-sm border border-orange-100/10 dark:border-orange-400/10">
            <ClientOnly>
              <LoginForm />
            </ClientOnly>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Нет аккаунта?{' '}
          <Link
            href="/register"
            className="font-medium text-orange-600 dark:text-orange-300 hover:underline"
          >
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  )
} 