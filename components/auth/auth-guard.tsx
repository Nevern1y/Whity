"use client"

import { useAuth } from "@/hooks/use-auth"
import { Spinner } from "@/components/ui/spinner"

export interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireAdmin?: boolean
}

export function AuthGuard({ 
  children, 
  requireAuth = true,
  requireAdmin = false 
}: AuthGuardProps) {
  const { isLoading, isAuthenticated, user } = useAuth(requireAuth)

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (requireAuth && !isAuthenticated) {
    return null
  }

  if (requireAdmin && user?.role !== "ADMIN") {
    return null
  }

  return <>{children}</>
} 