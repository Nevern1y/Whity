"use client"

import { Button } from "@/components/ui/button"
import { BarChart3 } from "lucide-react"
import { useRouter } from "next/navigation"

interface DashboardButtonProps {
  id: string
  currentUserId: string | undefined
}

export function DashboardButton({ id, currentUserId }: DashboardButtonProps) {
  const router = useRouter()

  if (id !== currentUserId) return null

  return (
    <Button
      onClick={() => router.push("/dashboard")}
      className="relative group overflow-hidden bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg transition-all duration-300 hover:shadow-orange-500/25 hover:scale-[1.02]"
    >
      <div className="absolute inset-0 bg-grid-white/10 bg-[size:6px_6px] transition-opacity duration-300 group-hover:opacity-50" />
      <div className="absolute -inset-x-1 top-0 h-px bg-gradient-to-r from-transparent via-orange-300 to-transparent opacity-30" />
      <div className="absolute -inset-x-1 bottom-0 h-px bg-gradient-to-r from-transparent via-orange-300 to-transparent opacity-30" />
      <div className="absolute inset-0 w-full h-full transition-all duration-300 opacity-0 group-hover:opacity-100">
        <div className="absolute inset-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,125,0,0.1),transparent_75%)]" />
      </div>
      <span className="relative flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-white" />
        Панель управления
      </span>
    </Button>
  )
} 