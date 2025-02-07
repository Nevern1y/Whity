"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function LoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  
  const form = useForm({
    defaultValues: {
      email: "",
      password: ""
    }
  })

  const onSubmit = async (values: any) => {
    try {
      setIsLoading(true)
      const res = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false
      })

      if (res?.error) {
        toast.error("Ошибка входа", {
          description: "Неверный email или пароль",
          duration: 5000,
        })
        return
      }

      toast.success("Добро пожаловать!", {
        description: "Вы успешно вошли в систему",
      })
      
      router.push("/")
      router.refresh()
    } catch (error) {
      toast.error("Что-то пошло не так", {
        description: "Попробуйте позже",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} type="email" />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          name="password" 
          render={({ field }) => (
            <FormItem>
              <FormLabel>Пароль</FormLabel>
              <FormControl>
                <Input {...field} type="password" />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Вход..." : "Войти"}
        </Button>
      </form>
    </Form>
  )
} 