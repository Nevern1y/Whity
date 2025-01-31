import { Metadata } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Достижения | Аллель Агро",
  description: "Ваши достижения на платформе",
}

export default async function AchievementsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login")

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Достижения</h1>
      {/* Добавьте компонент с достижениями */}
    </div>
  )
} 