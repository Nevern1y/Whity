"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"
import { useSocket } from "@/hooks/use-socket"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

// Компонент конфетти без использования canvas-confetti
function Confetti() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {[...Array(50)].map((_, i) => (
        <motion.div
          key={i}
          className={cn(
            "absolute w-2 h-2 rounded-full",
            "bg-primary"
          )}
          initial={{
            opacity: 1,
            top: "100%",
            left: `${Math.random() * 100}%`,
          }}
          animate={{
            opacity: 0,
            top: `${Math.random() * 50}%`,
            left: `${Math.random() * 100}%`,
            rotate: Math.random() * 360,
          }}
          transition={{
            duration: 1 + Math.random(),
            ease: "easeOut",
            delay: Math.random() * 0.2,
          }}
          style={{
            backgroundColor: `hsl(${Math.random() * 360}, 70%, 50%)`,
          }}
        />
      ))}
    </div>
  )
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
}

export function AchievementPopup() {
  const [achievement, setAchievement] = useState<Achievement | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const socket = useSocket()

  useEffect(() => {
    if (!socket) return

    socket.on("achievement-earned", (data: Achievement) => {
      setAchievement(data)
      setShowConfetti(true)
      setTimeout(() => {
        setShowConfetti(false)
        setTimeout(() => setAchievement(null), 500)
      }, 2000)
    })

    return () => {
      socket.off("achievement-earned")
    }
  }, [socket])

  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.3 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.5 }}
          className="fixed bottom-4 right-4 z-50"
        >
          {showConfetti && <Confetti />}
          <Card className={cn(
            "bg-gradient-to-br from-primary to-primary-foreground",
            "text-primary-foreground p-6 shadow-xl",
            "border-2 border-primary-foreground/10"
          )}>
            <div className="flex items-center gap-4">
              <motion.div 
                className="text-4xl"
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, -10, 10, -10, 0] 
                }}
                transition={{ 
                  duration: 0.5,
                  times: [0, 0.2, 0.4, 0.6, 0.8],
                  repeat: Infinity,
                  repeatDelay: 1
                }}
              >
                {achievement.icon}
              </motion.div>
              <div className="space-y-2">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-1"
                >
                  <h4 className="font-bold text-xl">Новое достижение!</h4>
                  <p className="text-primary-foreground/90">{achievement.title}</p>
                  <p className="text-sm text-primary-foreground/70">{achievement.description}</p>
                </motion.div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 