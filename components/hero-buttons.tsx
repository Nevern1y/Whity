"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { BookOpen, UserPlus, Info, Rocket, BookMarked, ArrowRight, Play } from "lucide-react"
import Link from "next/link"
import { useSession } from "next-auth/react"

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0 },
  show: { opacity: 1 }
}

export function HeroButtons() {
  const { data: session } = useSession()

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="mt-12 space-y-8"
    >
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        {!session ? (
          <motion.div variants={item}>
            <Link href="/courses" passHref>
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-primary to-primary/80"
              >
                <BookOpen className="mr-2 h-5 w-5" />
                Начать обучение
              </Button>
            </Link>
          </motion.div>
        ) : (
          <motion.div variants={item}>
            <Link href="/dashboard" passHref>
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-primary to-primary/80"
              >
                <Rocket className="mr-2 h-5 w-5" />
                Перейти к обучению
              </Button>
            </Link>
          </motion.div>
        )}
      </div>

      <motion.div variants={item} className="flex justify-center">
        <Link href="/about" passHref>
          <Button 
            variant="ghost" 
            size="lg"
            className="text-muted-foreground hover:text-primary transition-colors group"
          >
            <Info className="mr-2 h-4 w-4" />
            <span className="group-hover:mr-1 transition-all">
              Узнать больше о платформе
            </span>
          </Button>
        </Link>
      </motion.div>
    </motion.div>
  )
} 