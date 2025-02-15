"use client"

import { useAnimation } from "@/components/providers/animation-provider"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useSession } from "next-auth/react"
import { ArticlesList } from "@/components/articles-list"

export default function ArticlesPage() {
  const { m } = useAnimation()
  const { data: session } = useSession()

  return (
    <div className="container py-8">
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Статьи</h1>
            <p className="text-muted-foreground">
              Полезные материалы и руководства
            </p>
          </div>
          {session?.user && (
            <Button asChild>
              <a href="/articles/new">
                <Plus className="h-4 w-4 mr-2" />
                Написать статью
              </a>
            </Button>
          )}
        </div>

        <ArticlesList />
      </m.div>
    </div>
  )
} 