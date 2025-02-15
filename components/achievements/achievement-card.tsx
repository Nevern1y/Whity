"use client"

const { m } = useAnimation()
import { useAnimation } from "@/components/providers/animation-provider"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface AchievementCardProps {
  title: string
  description: string
  icon: string
  progress: number
  requirement: number
  completed: boolean
  earnedAt: Date | null | undefined
}

export function AchievementCard({
  title,
  description,
  icon,
  progress,
  requirement,
  completed,
  earnedAt
}: AchievementCardProps) {
  const progressPercentage = (progress / requirement) * 100

  return (
    <m.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={cn(
        "relative overflow-hidden transition-colors",
        completed && "bg-primary/5 border-primary/20"
      )}>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className={cn(
              "flex h-12 w-12 items-center justify-center rounded-full",
              "text-2xl bg-primary/10"
            )}>
              {icon}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{title}</h3>
                {completed && (
                  <m.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-primary"
                  >
                    ✓
                  </m.div>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{description}</p>
              {earnedAt && (
                <p className="text-xs text-muted-foreground">
                  Получено: {new Date(earnedAt).toLocaleDateString()}
                </p>
              )}
              <div className="mt-4 space-y-1">
                <Progress value={progressPercentage} />
                <p className="text-xs text-muted-foreground text-right">
                  {progress} / {requirement}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </m.div>
  )
} 