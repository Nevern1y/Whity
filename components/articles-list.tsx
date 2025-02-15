"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, Trash } from "lucide-react"
import { AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { staggerContainer, listItem, transitions } from "@/lib/framer-animations"
import { useAnimation } from "@/components/providers/animation-provider"

interface Article {
  id: string
  title: string
  content: string
  image?: string
  author: {
    name: string | null
    image: string | null
  }
  createdAt: string
  updatedAt: string
  authorId: string
  published: boolean
}

export function ArticlesList() {
  const { data: session } = useSession()
  const [articles, setArticles] = useState<Article[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()
  const { m } = useAnimation()

  useEffect(() => {
    fetchArticles()
    if (session?.user) {
      checkAdminStatus()
    }
  }, [session])

  const fetchArticles = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/articles")
      if (!response.ok) throw new Error("Failed to fetch articles")
      const data = await response.json()
      setArticles(data)
    } catch (error) {
      console.error("Error fetching articles:", error)
      toast.error("Не удалось загрузить статьи")
    } finally {
      setIsLoading(false)
    }
  }

  const checkAdminStatus = async () => {
    try {
      const response = await fetch("/api/user/role")
      const { role } = await response.json()
      setIsAdmin(role === "ADMIN")
    } catch (error) {
      console.error("Error checking admin status:", error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Вы уверены, что хотите удалить эту статью?")) return

    try {
      const response = await fetch(`/api/articles/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete article")

      toast.success("Статья успешно удалена")
      fetchArticles()
    } catch (error) {
      console.error("Error deleting article:", error)
      toast.error("Не удалось удалить статью")
    }
  }

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading...</div>
  }

  return (
    <m.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      variants={staggerContainer}
      transition={transitions.default}
      initial="initial"
      animate="animate"
    >
      <AnimatePresence mode="popLayout">
        {articles.map((article) => (
          <m.div
            key={article.id}
            variants={listItem}
            transition={transitions.default}
            layout
            layoutId={article.id}
            className="h-full"
          >
            <Card className="overflow-hidden h-full flex flex-col">
              {article.image && (
                <div className="relative h-48 w-full">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="p-6 flex-1">
                <h2 className="text-xl font-semibold mb-2">{article.title}</h2>
                <p className="text-muted-foreground line-clamp-3">
                  {article.content}
                </p>
              </div>
              <div className="p-6 pt-0 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  {article.author?.image && (
                    <img
                      src={article.author.image}
                      alt={article.author.name || ""}
                      className="h-8 w-8 rounded-full"
                    />
                  )}
                  <span className="text-sm text-muted-foreground">
                    {article.author?.name}
                  </span>
                </div>
                {isAdmin && (
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => window.location.href = `/articles/edit/${article.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => handleDelete(article.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </m.div>
        ))}
      </AnimatePresence>
    </m.div>
  )
} 