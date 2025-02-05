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
          <SocketProvider />
        </Providers>
      </body>
    </html>
  )
}

