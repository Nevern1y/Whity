"use client"

import { createContext, useContext, useMemo, useEffect, useState, type ReactNode } from "react"
import { LazyMotion, domAnimation, m } from "framer-motion"

// Animation context types
interface AnimationStateType {
  isReady: boolean
  isAnimating: boolean
}

interface AnimationContextType {
  isReady: boolean
  m: typeof m | null
}

// Create context with default value
const AnimationContext = createContext<AnimationContextType>({
  isReady: false,
  m: null
})

// Combined hook for animations with safety check
export function useAnimation() {
  const context = useContext(AnimationContext)
  if (!context) {
    throw new Error("useAnimation must be used within an AnimationProvider")
  }
  return context
}

interface AnimationProviderProps {
  children: ReactNode
}

// Client-side wrapper component
function ClientAnimationWrapper({ children }: { children: ReactNode }) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return children
}

export function AnimationProvider({ children }: AnimationProviderProps) {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      setIsReady(true)
    })
    return () => cancelAnimationFrame(timer)
  }, [])

  const value = useMemo<AnimationContextType>(() => ({
    isReady,
    m: isReady ? m : null
  }), [isReady])

  return (
    <ClientAnimationWrapper>
      <AnimationContext.Provider value={value}>
        <LazyMotion features={domAnimation} strict>
          {children}
        </LazyMotion>
      </AnimationContext.Provider>
    </ClientAnimationWrapper>
  )
} 