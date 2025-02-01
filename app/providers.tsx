"use client"

import { ThemeProvider } from "next-themes"
import { SessionProvider } from "next-auth/react"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "sonner"
import { NotificationsProvider } from "@/components/notifications/notifications-context"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <NotificationsProvider>
          {children}
          <Toaster />
          <Sonner />
        </NotificationsProvider>
      </ThemeProvider>
    </SessionProvider>
  )
} 