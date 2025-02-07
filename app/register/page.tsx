"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Lock, User, ArrowRight, AlertCircle } from "lucide-react"
import { AuthBackground } from "@/components/auth/auth-background"

// Импортируем тот же компонент Logo, что и в login
function Logo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      fill="none" 
      height="48" 
      viewBox="0 0 44 48" 
      width="44" 
      xmlns="http://www.w3.org/2000/svg"
      className="h-24 w-24"
      {...props}
    >
      <g fill="currentColor">
        <path d="m30.8 10.7998h-30.8l4.4 8.7999h26.4c4.8601 0 8.8 3.9399 8.8 8.8s-3.9399 8.7999-8.8 8.7999c7.2902 0 13.2-5.9098 13.2-13.1999s-5.9098-13.1999-13.2-13.1999z"/>
        <path d="m20.7835 34.7676c-1.4628-2.9255.6646-6.3677 3.9354-6.3677h6.0807c2.4301 0 4.4 1.9699 4.4 4.4 0 2.43-1.9699 4.3999-4.4 4.3999h-6.0807c-1.6665 0-3.1901-.9416-3.9354-2.4322z" opacity=".3"/>
        <path d="m30.8008 19.6001h-22.00002l4.40002 8.7999h17.6c2.43 0 4.4 1.97 4.4 4.4 0 2.4301-1.97 4.4-4.4 4.4 4.8601 0 8.8-3.9399 8.8-8.8 0-4.86-3.9399-8.7999-8.8-8.7999z" opacity=".6"/>
      </g>
    </svg>
  )
}

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  })
  const [error, setError] = useState("")

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Пароли не совпадают")
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Ошибка при регистрации")
      }

      toast.success("Регистрация успешна!")
      router.push("/login")
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : "Ошибка при регистрации")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden bg-gradient-to-br from-background via-background/95 to-background">
      <AuthBackground />

      <div className="w-full max-w-[400px] space-y-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <Link href="/" className="inline-block group">
            <Logo className="mx-auto text-primary group-hover:text-primary/80 transition-all duration-300 transform group-hover:scale-110" />
          </Link>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
              Создайте аккаунт
            </h1>
            <p className="text-base text-muted-foreground">
              Присоединяйтесь к нашему сообществу
            </p>
          </div>
        </motion.div>

        <Card className="border-none shadow-2xl backdrop-blur-md bg-card/50">
          <CardContent className="pt-6">
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Имя</Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder="Иван Иванов"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-destructive text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <motion.div
                      className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    Регистрация...
                  </>
                ) : (
                  <>
                    Зарегистрироваться
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center text-sm text-muted-foreground"
        >
          Уже есть аккаунт?{" "}
          <Link 
            href="/login" 
            className="text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Войти
          </Link>
        </motion.p>
      </div>
    </div>
  )
} 