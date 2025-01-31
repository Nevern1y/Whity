"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

interface Article {
  id: string
  title: string
  content: string
  image: string
  author: {
    name: string
    image: string
  }
  // ... другие поля, если нужны
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    fetchArticles()
    checkAdminStatus()
  }, [])

  const fetchArticles = async () => {
    const response = await fetch("/api/articles")
    const data = await response.json()
    setArticles(data)
  }

  const checkAdminStatus = async () => {
    const response = await fetch("/api/user/role")
    const { role } = await response.json()
    setIsAdmin(role === "ADMIN")
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">База знаний</h1>
        {isAdmin && (
          <Link href="/articles/new" className="block">
            <Button className="w-full">
              Добавить статью
            </Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article: Article) => (
          <motion.div
            key={article.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="overflow-hidden h-full flex flex-col">
              <img
                src={article.image}
                alt={article.title}
                className="h-48 w-full object-cover"
              />
              <div className="p-6 flex-1">
                <h2 className="text-xl font-semibold mb-2">{article.title}</h2>
                <p className="text-muted-foreground line-clamp-3">
                  {article.content}
                </p>
              </div>
              <div className="p-6 pt-0 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <img
                    src={article.author.image}
                    alt={article.author.name}
                    className="h-8 w-8 rounded-full"
                  />
                  <span className="text-sm text-muted-foreground">
                    {article.author.name}
                  </span>
                </div>
                {isAdmin && (
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive">
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
} 