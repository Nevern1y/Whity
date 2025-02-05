import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Providers } from "@/components/providers"
import { AchievementPopup } from "@/components/achievements/achievement-popup"
import { useUserStore } from "@/lib/store/user-store"
import { auth } from "@/lib/auth"
import { SocketProvider } from "@/components/providers/socket-provider"
import { RedirectHandler } from "@/components/providers/redirect-handler"
import { OnlineStatusHandler } from "@/app/components/providers/online-status-handler"
import { StatusHandler } from "@/components/providers/status-handler"
import { headers } from 'next/headers'
import { WebSocketProvider } from '@/providers/websocket-provider'

const inter = Inter({ subsets: ["latin", "cyrillic"] })

export const metadata: Metadata = {
  title: "Агропромышленная платформа",
  description: "Образовательная платформа для специалистов агропромышленного комплекса",
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  
  if (session?.user?.image) {
    useUserStore.getState().setUserImage(session.user.image)
  }

  const headersList = headers()
  const host = headersList.get('host') || 'localhost:3000'
  const protocol = process.env.NODE_ENV === 'production' ? 'wss' : 'ws'
  const wsUrl = `${protocol}://${host}`

  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <RedirectHandler />
          <OnlineStatusHandler />
          <StatusHandler />
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <AchievementPopup />
        </Providers>
      </body>
    </html>
  )
}

