"use client"

import { ThemeProvider } from "next-themes"
import { SessionProvider } from "next-auth/react"
import { NotificationsProvider } from "@/components/notifications/notifications-context"
import { Toaster } from "sonner"

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
          <Toaster richColors position="top-right" />
          {children}
        </NotificationsProvider>
      </ThemeProvider>
    </SessionProvider>
  )
} 