"use client"

import dynamic from "next/dynamic"
import { AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"
import { useSocket } from "@/hooks/use-socket"
import { Card } from "@/components/ui/card"
import { Trophy } from "lucide-react"
import { useAnimation } from "@/components/providers/animation-provider"

interface Achievement {
  id: string
  title: string
  description: string
  image?: string
  xpReward: number
}

const popupVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.8,
    y: 50 
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.8,
    y: 50,
    transition: {
      duration: 0.2
    }
  }
}

const iconVariants = {
  hidden: { scale: 0 },
  visible: { 
    scale: 1,
    transition: {
      delay: 0.2,
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  }
}

export function AchievementPopup() {
  const [achievement, setAchievement] = useState<Achievement | null>(null)
  const socket = useSocket()
  const { m } = useAnimation()

  useEffect(() => {
    if (!socket) return

    const handleAchievement = (data: Achievement) => {
      setAchievement(data)
      // Автоматически скрываем через 5 секунд
      setTimeout(() => {
        setAchievement(null)
      }, 5000)
    }

    socket.on("achievement_unlocked", handleAchievement)

    return () => {
      socket.off("achievement_unlocked", handleAchievement)
    }
  }, [socket])

  return (
    <AnimatePresence mode="wait">
      {achievement && (
        <m.div
          className="fixed bottom-4 right-4 z-50"
          variants={popupVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <Card className="p-4 w-[300px] bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20">
            <div className="flex items-start gap-4">
              <m.div
                variants={iconVariants}
                className="flex-shrink-0 p-2 rounded-full bg-yellow-500/20"
              >
                <Trophy className="h-6 w-6 text-yellow-500" />
              </m.div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-yellow-500">
                  {achievement.title}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {achievement.description}
                </p>
                <p className="text-xs text-yellow-500/80 mt-1">
                  +{achievement.xpReward} XP
                </p>
              </div>
            </div>
          </Card>
        </m.div>
      )}
    </AnimatePresence>
  )
}

export const AchievementPopupDynamic = dynamic(() => Promise.resolve(AchievementPopup), {
  ssr: false
}) 