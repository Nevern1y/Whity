// This is a Server Component
import { Suspense } from "react"
import { DashboardContent } from "./_components/dashboard-content"
import { DashboardSkeleton } from "./_components/dashboard-skeleton"
import { AnimationProvider } from "@/components/providers/animation-provider"

export default function DashboardPage() {
  return (
    <AnimationProvider>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </AnimationProvider>
  )
}

