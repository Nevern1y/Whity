"use client"

import { Button } from "@/components/ui/button"
import { BarChart3 } from "lucide-react"
import { useRouter } from "next/navigation"

interface DashboardButtonProps {
  userId: string
  currentUserId: string | undefined
}

export function DashboardButton({ userId, currentUserId }: DashboardButtonProps) {
  const router = useRouter()

  if (userId !== currentUserId) return null

  return (
    <Button
      onClick={() => router.push("/dashboard")}
      className="w-full group relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-600 to-orange-500 dark:from-orange-400 dark:to-orange-300 p-[2px] transition-all hover:shadow-lg hover:-translate-y-1"
    >
      <div className="relative flex h-full w-full items-center justify-center rounded-lg bg-white/[0.85] dark:bg-black/[0.85] px-4 py-2 transition-all group-hover:bg-opacity-90">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:16px] [mask-image:radial-gradient(white,transparent_90%)]" />
        
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          <span className="text-base font-medium text-orange-600 dark:text-orange-400">
            Панель управления
          </span>
        </div>
        
        <div className="absolute inset-0 pointer-events-none border border-orange-200/20 dark:border-orange-400/10 rounded-lg" />
        
        {/* Shine effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute inset-0 translate-x-full group-hover:animate-[shimmer_1s_ease-in-out] bg-gradient-to-r from-transparent via-orange-100/10 dark:via-orange-400/10 to-transparent" />
        </div>
      </div>
    </Button>
  )
} 