"use client"

import { ThemeProvider } from "next-themes"
import { SessionProvider } from "next-auth/react"
import { Toaster } from "sonner"
import { SocketProvider } from "./socket-provider"
import { StatusHandler } from "./status-handler"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <SocketProvider>
          <StatusHandler />
          {children}
          <Toaster richColors position="top-center" />
        </SocketProvider>
      </ThemeProvider>
    </SessionProvider>
  )
} 