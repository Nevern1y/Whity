import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/toaster"
import { Footer } from "@/components/footer"
import { Providers } from "@/components/providers"
import { AchievementPopup } from "@/components/achievements/achievement-popup"
import { useUserStore } from "@/lib/store/user-store"
import { auth } from "@/auth"
import { headers } from 'next/headers'
import { themeScript } from "./theme-script"
import { Layout } from "@/components/layout"
import { GeistSans } from "geist/font/sans"

const inter = Inter({ subsets: ["latin", "cyrillic"] })

export const metadata: Metadata = {
  title: {
    default: "АЛЕЛЬ АГРО",
    template: "%s | АЛЕЛЬ АГРО"
  },
  description: "Образовательная платформа для специалистов агропромышленности",
  icons: {
    icon: [
      {
        url: '/favicon.svg',
        type: 'image/svg+xml',
      }
    ]
  }
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
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript() }} />
      </head>
      <body className={cn(
        inter.className,
        "min-h-screen bg-background antialiased layout-container",
        "selection:bg-primary selection:text-primary-foreground",
        GeistSans.className
      )}>
        <Providers>
          <Layout>
            <div className="relative flex min-h-screen flex-col">
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </Layout>
          <AchievementPopup />
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}

