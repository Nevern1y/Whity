"use client"

import { useAnimation } from "@/components/providers/animation-provider"
import type { ComponentType } from "react"
import type { m } from "framer-motion"

export interface WithMotionProps {
  m: typeof m | null
  isReady: boolean
}

export function withAnimation<P extends object>(
  WrappedComponent: ComponentType<P & WithMotionProps>
) {
  function WithAnimationWrapper(props: Omit<P, keyof WithMotionProps>) {
    const { m, isReady } = useAnimation()

    return (
      <WrappedComponent
        {...(props as P)}
        m={m}
        isReady={isReady}
      />
    )
  }

  WithAnimationWrapper.displayName = `WithAnimation(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`

  return WithAnimationWrapper
} 