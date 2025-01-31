"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { MobileHeader } from "./mobile-header"
import { MobileNavBar } from "./mobile-nav-bar"
import { Navbar } from "./navbar"
import { Footer } from "./footer"
import { cn } from "@/lib/utils"

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const [isMounted, setIsMounted] = useState(false)
  const pathname = usePathname()
  
  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return null

  const isAuthPage = pathname === '/login' || pathname === '/register'
  
  return (
    <div className="min-h-screen flex flex-col">
      {!isAuthPage && (
        <>
          <div className="hidden md:block">
            <Navbar />
          </div>
          <MobileHeader />
        </>
      )}
      <main className={cn(
        "flex-1",
        !isAuthPage && "md:pt-16 pb-16 md:pb-0"
      )}>
        {children}
      </main>
      {!isAuthPage && (
        <>
          <div className="hidden md:block">
            <Footer />
          </div>
          <MobileNavBar />
        </>
      )}
    </div>
  )
} 