"use client"

import { useState } from "react"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"

export function MobileHeader() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur-lg md:hidden safe-top">
      <div className="container flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src="/logo.png" // Убедитесь, что у вас есть логотип
            alt="Аллель Агро"
            width={32}
            height={32}
            className="rounded-lg"
          />
          {!isSearchOpen && (
            <motion.span 
              className="font-semibold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              АЛЛЕЛЬ АГРО
            </motion.span>
          )}
        </Link>

        <AnimatePresence mode="wait">
          {isSearchOpen ? (
            <motion.div 
              key="search"
              initial={{ opacity: 0, width: "0%" }}
              animate={{ opacity: 1, width: "100%" }}
              exit={{ opacity: 0, width: "0%" }}
              className="absolute inset-x-0 top-0 h-full bg-background/95 backdrop-blur-lg px-4"
            >
              <div className="flex h-full items-center gap-2">
                <Input
                  type="search"
                  placeholder="Поиск..."
                  className="h-9 flex-1"
                  autoFocus
                />
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setIsSearchOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </motion.div>
          ) : (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="h-5 w-5" />
            </Button>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
} 