import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarDays, Eye } from "lucide-react"
import Link from "next/link"

interface KnowledgeCardProps {
  title: string
  category: string
  description: string
  views: number
  lastUpdated: string
}

export function KnowledgeCard({ title, category, description, views, lastUpdated }: KnowledgeCardProps) {
  return (
    <Card className="flex flex-col">
      <CardContent className="flex-grow p-4">
        <div className="space-y-2">
          <Badge variant="outline">{category}</Badge>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Eye className="h-4 w-4" />
          <span>{views} просмотров</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <CalendarDays className="h-4 w-4" />
          <span>Обновлено: {lastUpdated}</span>
        </div>
      </CardFooter>
      <CardFooter className="p-4 pt-0">
        <Button asChild className="w-full">
          <Link href="#">Читать статью</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

