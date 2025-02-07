"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { LogIn, Mail, Lock } from "lucide-react"
import { AuthBackground } from "@/components/auth/auth-background"

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

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      })

      if (result?.error) {
        toast.error("Неверный email или пароль")
      } else {
        router.push("/dashboard")
        toast.success("Добро пожаловать!")
      }
    } catch (error) {
      toast.error("Произошла ошибка при входе")
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
              С возвращением!
            </h1>
            <p className="text-base text-muted-foreground">
              Войдите в свой аккаунт для продолжения
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-none shadow-2xl backdrop-blur-md bg-card/50">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Пароль</Label>
                    <Link 
                      href="/forgot-password"
                      className="text-sm text-primary hover:underline"
                    >
                      Забыли пароль?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

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
                      Вход...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      Войти
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center text-sm text-muted-foreground"
        >
          Нет аккаунта?{" "}
          <Link 
            href="/register" 
            className="text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Зарегистрироваться
          </Link>
        </motion.p>
      </div>
    </div>
  )
} 