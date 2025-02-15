import { Suspense } from "react"
import { auth } from "@/auth"
import { ArticlesList } from "@/components/articles-list"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default async function KnowledgeBasePage() {
  const session = await auth()
  const isAdmin = session?.user?.role === "ADMIN"

  return (
    <div className="container py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">База знаний</h1>
          <p className="text-muted-foreground">
            Актуальные материалы и исследования в области агропромышленности
          </p>
        </div>
        {isAdmin && (
          <Link href="/knowledge/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Создать
            </Button>
          </Link>
        )}
      </div>

      <Suspense fallback={<div>Загрузка...</div>}>
        <ArticlesList />
      </Suspense>
    </div>
  )
}

