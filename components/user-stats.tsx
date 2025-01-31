import { Card, CardContent } from "@/components/ui/card"
import { Laptop, Award, Trophy } from "lucide-react"

export function UserStats() {
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="mb-6 text-2xl font-semibold text-primary">Статистика</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Laptop className="h-7 w-7 text-primary" />
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">5</div>
              <div className="text-sm text-muted-foreground">Завершённых курсов</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary/10">
              <Award className="h-7 w-7 text-secondary" />
            </div>
            <div>
              <div className="text-3xl font-bold text-secondary">3</div>
              <div className="text-sm text-muted-foreground">Достижений</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Trophy className="h-7 w-7 text-primary" />
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">3</div>
              <div className="text-sm text-muted-foreground">Место в рейтинге</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

