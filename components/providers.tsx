"use client"

import { ThemeProvider } from "next-themes"
import { AuthProvider } from "./providers/session-provider"
import { NotificationsProvider } from "@/components/notifications/notifications-context"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider 
        attribute="class" 
        defaultTheme="system" 
        enableSystem
      >
        <NotificationsProvider>
          {children}
        </NotificationsProvider>
      </ThemeProvider>
    </AuthProvider>
  )
} 