"use client"

import { useState, useEffect, Suspense, useRef } from "react"
import { usePathname } from "next/navigation"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { MobileNavBar } from "@/components/mobile-nav-bar"
import { cn } from "@/lib/utils"
import { useAnimation } from "@/components/providers/animation-provider"
import type { m } from "framer-motion"

interface LayoutProps {
  children: React.ReactNode
}

interface MainContentProps {
  children: React.ReactNode
  isAuthPage: boolean
  isFullWidth: boolean
}

function MainContent({ children, isAuthPage, isFullWidth }: MainContentProps) {
  return (
    <main 
      className={cn(
        "flex-1",
        isAuthPage === false && "pt-16 pb-8",
        isFullWidth === false && "container max-w-7xl mx-auto",
        "px-4 md:px-6 transition-all duration-200",
        !isAuthPage && "md:pl-[68px]"
      )}
    >
      <Suspense fallback={null}>
        {children}
      </Suspense>
    </main>
  )
}

interface AnimatedMainContentProps extends MainContentProps {
  m: NonNullable<typeof m>
}

function AnimatedMainContent({ children, isAuthPage, isFullWidth, m }: AnimatedMainContentProps) {
  const [shouldAnimate, setShouldAnimate] = useState(false)
  const mountedRef = useRef(false)
  const MotionMain = m.main

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true
      requestAnimationFrame(() => {
        setShouldAnimate(true)
      })
    }
    return () => {
      mountedRef.current = false
    }
  }, [])

  const mainContent = (
    <main 
      className={cn(
        "flex-1",
        isAuthPage === false && "pt-16 pb-8",
        isFullWidth === false && "container max-w-7xl mx-auto",
        "px-4 md:px-6 transition-all duration-200",
        !isAuthPage && "md:pl-[68px]"
      )}
    >
      <Suspense fallback={null}>
        {children}
      </Suspense>
    </main>
  )

  if (!shouldAnimate) {
    return mainContent
  }

  return (
    <MotionMain 
      className={cn(
        "flex-1",
        isAuthPage === false && "pt-16 pb-8",
        isFullWidth === false && "container max-w-7xl mx-auto",
        "px-4 md:px-6 transition-all duration-200",
        !isAuthPage && "md:pl-[68px]"
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Suspense fallback={null}>
        {children}
      </Suspense>
    </MotionMain>
  )
}

export function Layout({ children }: LayoutProps) {
  const [isMounted, setIsMounted] = useState(false)
  const pathname = usePathname()
  const isMobile = useMediaQuery("(max-width: 768px)")
  const { m, isReady } = useAnimation()
  const mountedRef = useRef(false)
  
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true
      requestAnimationFrame(() => {
        setIsMounted(true)
      })
    }
    return () => {
      mountedRef.current = false
    }
  }, [])

  if (!isMounted) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className={cn(
          "flex-1",
          "pt-16 pb-20 md:pb-8",
          "container max-w-7xl mx-auto",
          "px-4 md:px-6"
        )} />
      </div>
    )
  }

  const isAuthPage = pathname?.startsWith('/auth') ?? false
  const isFullWidth = (pathname?.startsWith('/courses/') || pathname?.startsWith('/knowledge/')) ?? false
  
  return (
    <div className="min-h-screen flex">
      {!isAuthPage && <Sidebar className="hidden md:flex" />}
      <div className={cn(
        "flex-1 flex flex-col min-h-screen transition-all duration-200"
      )}>
        {!isAuthPage && <Header />}
        <Suspense fallback={
          <main className={cn(
            "flex-1",
            "pt-16 pb-8",
            "container max-w-7xl mx-auto",
            "px-4 md:px-6 transition-all duration-200",
            !isAuthPage && "md:pl-[68px]"
          )} />
        }>
          {isReady && m ? (
            <AnimatedMainContent
              isAuthPage={isAuthPage}
              isFullWidth={isFullWidth}
              m={m}
            >
              {children}
            </AnimatedMainContent>
          ) : (
            <MainContent
              isAuthPage={isAuthPage}
              isFullWidth={isFullWidth}
            >
              {children}
            </MainContent>
          )}
        </Suspense>
        {!isAuthPage && isMobile && <MobileNavBar />}
      </div>
    </div>
  )
} 