"use client"

import { signIn } from "next-auth/react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function LoginForm() {
  const router = useRouter()

  async function onSubmit(data: { email: string; password: string }) {
    const response = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    })

    if (response?.error) {
      toast.error(response.error)
      return
    }

    router.push("/dashboard")
  }

  return (
    <form className="space-y-4">
      {/* форма логина */}
    </form>
  )
} 