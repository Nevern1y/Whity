"use client"

import { ThemeProvider } from "next-themes"
import { SessionProvider } from "next-auth/react"
import { Toaster } from "sonner"
import { SocketProvider } from "./socket-provider"
import { NotificationsProvider } from "./notifications-provider"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"
import { AnimationProvider } from "./animation-provider"
import { RedirectHandler } from "./redirect-handler"
import { OnlineStatusHandler } from "@/app/components/providers/online-status-handler"
import { StatusHandler } from "./status-handler"

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000,
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SocketProvider>
            <NotificationsProvider>
              <AnimationProvider>
                <RedirectHandler />
                <OnlineStatusHandler />
                <StatusHandler />
                {children}
              </AnimationProvider>
            </NotificationsProvider>
          </SocketProvider>
        </ThemeProvider>
      </SessionProvider>
    </QueryClientProvider>
  )
} 