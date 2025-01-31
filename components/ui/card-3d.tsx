"use client"

import { useState } from "react"
import { motion, AnimatePresence, HTMLMotionProps } from "framer-motion"
import { cn } from "@/lib/utils"

interface Card3DProps extends Omit<HTMLMotionProps<"div">, "children"> {
  gradient?: string
  children: React.ReactNode
}

export function Card3D({ className, children, gradient, ...props }: Card3DProps) {
  const [rotate, setRotate] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget
    const box = card.getBoundingClientRect()
    const x = e.clientX - box.left
    const y = e.clientY - box.top
    const centerX = box.width / 2
    const centerY = box.height / 2
    const rotateX = (y - centerY) / 20
    const rotateY = (centerX - x) / 20

    setRotate({ x: rotateX, y: rotateY })
  }

  const handleMouseEnter = () => setIsHovered(true)
  const handleMouseLeave = () => {
    setIsHovered(false)
    setRotate({ x: 0, y: 0 })
  }

  return (
    <motion.div
      {...props}
      className={cn(
        "relative overflow-hidden rounded-xl backdrop-blur-sm",
        "border border-white/10 bg-white/5",
        "transition-all duration-300 ease-out",
        "hover:shadow-xl hover:shadow-primary/20",
        gradient,
        className
      )}
      initial={{ scale: 1 }}
      whileHover={{ scale: 1.02 }}
      animate={{
        rotateX: rotate.x,
        rotateY: rotate.y,
        transformPerspective: 1000,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 pointer-events-none"
          />
        )}
      </AnimatePresence>
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-transparent to-white/5 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  )
} 