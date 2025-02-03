import { SessionProvider } from "next-auth/react"
import { ToastProvider } from "./ui/toast-provider"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </SessionProvider>
  )
} 