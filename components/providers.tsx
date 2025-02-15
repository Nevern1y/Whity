"use client"

import { ThemeProvider } from "next-themes"
import { AuthProvider } from "./providers/session-provider"
import { NotificationsProvider } from "@/components/notifications/notifications-context"
import { AnimationProvider } from "@/components/providers/animation-provider"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider 
        attribute="class" 
        defaultTheme="system" 
        enableSystem
      >
        <NotificationsProvider>
          <AnimationProvider>
            {children}
          </AnimationProvider>
        </NotificationsProvider>
      </ThemeProvider>
    </AuthProvider>
  )
} 