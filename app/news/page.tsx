import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import { Plus } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Обновляем интерфейс в соответствии с моделью из базы данных
interface News {
  id: string
  title: string
  content: string
  image: string | null
  createdAt: Date
  updatedAt: Date
  authorId: string
  author: {
    name: string | null
    image: string | null
  }
}

async function getNews() {
  const news = await prisma.news.findMany({
    include: {
      author: {
        select: {
          name: true,
          image: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
  return news
}

async function isAdmin(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  })
  return user?.role === "ADMIN"
}

export default async function NewsPage() {
  const session = await auth()
  const news = await getNews()
  const userIsAdmin = session?.user?.id ? await isAdmin(session.user.id) : false

  return (
    <div className="container px-4 py-6 md:py-10">
      <div className="flex justify-between items-center mb-6 md:mb-8">
        <h1 className="text-3xl md:text-4xl font-bold">Новости птицеводства</h1>
        {userIsAdmin && (
          <Link href="/news/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Создать новость
            </Button>
          </Link>
        )}
      </div>

      <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {news.map((item: News) => (
          <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative h-40 md:h-48">
              <Image
                src={item.image || "/news/default.jpg"}
                alt={item.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute top-2 right-2 md:top-4 md:right-4 bg-primary/90 text-primary-foreground px-2 py-1 md:px-3 md:py-1 rounded-full text-xs md:text-sm">
                Новость
              </div>
            </div>
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-lg md:text-xl">{item.title}</CardTitle>
              <CardDescription className="text-sm">
                {formatDate(item.createdAt)} • {item.author.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <p className="text-sm md:text-base text-muted-foreground">
                {item.content.slice(0, 150)}...
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

