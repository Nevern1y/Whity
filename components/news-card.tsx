import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarDays } from "lucide-react"
import Link from "next/link"

interface NewsCardProps {
  id: number
  title: string
  content: string
  category: string
  author: string
  createdAt: Date
}

export function NewsCard({ id, title, content, category, author, createdAt }: NewsCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{category}</Badge>
              <div className="flex items-center text-sm text-muted-foreground">
                <CalendarDays className="mr-1 h-3 w-3" />
                {new Date(createdAt).toLocaleDateString()}
              </div>
            </div>
            <h2 className="text-xl font-semibold">{title}</h2>
            <p className="text-muted-foreground">{content.slice(0, 150)}...</p>
            <p className="text-sm text-muted-foreground">Автор: {author}</p>
          </div>
          <Button asChild>
            <Link href={`/news/${id}`}>Читать далее</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

