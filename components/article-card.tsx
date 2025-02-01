import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface Article {
  id: string
  title: string
  content: string
  image?: string
  author?: {
    name: string
    image?: string
  }
}

interface ArticleCardProps {
  article: Article
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>{article.title}</CardTitle>
      </CardHeader>
      
      <CardContent>
        <p className="text-muted-foreground line-clamp-3">
          {article.content}
        </p>
      </CardContent>

      <CardFooter className="flex justify-between items-center">
        {article.author && (
          <div className="flex items-center gap-2">
            {article.author.image && (
              <img 
                src={article.author.image} 
                alt={article.author.name}
                className="w-6 h-6 rounded-full"
              />
            )}
            <span className="text-sm text-muted-foreground">
              {article.author.name}
            </span>
          </div>
        )}
        <Link href={`/articles/${article.id}`} passHref>
          <Button variant="ghost">Читать далее</Button>
        </Link>
      </CardFooter>
    </Card>
  )
} 