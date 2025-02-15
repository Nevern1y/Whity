"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { Sprout } from "lucide-react"
import React from "react"

interface LogoProps {
  className?: string
  showText?: boolean
  asLink?: boolean
  wrapper?: React.ReactElement
}

export function Logo({ className, showText = true, asLink = true, wrapper }: LogoProps) {
  const content = (
    <>
      <div className="relative">
        <Sprout className={cn(
          "h-6 w-6 text-primary transition-transform duration-300",
          "group-hover:scale-110"
        )} />
        <div className="absolute -inset-1 rounded-full bg-primary/10 blur-sm" />
      </div>
      <span className={cn(
        "font-semibold tracking-wide uppercase",
        "text-foreground/90",
        "transition-colors duration-300",
        "group-hover:text-primary",
        showText ? "inline-flex items-center" : "hidden md:inline-flex"
      )}>
        <span className="text-primary font-bold">Аллель</span>
        <span className="ml-1.5 text-muted-foreground">Агро</span>
      </span>
    </>
  )

  const styles = cn(
    "group flex items-center gap-3",
    "text-lg transition-all duration-300",
    "hover:gap-4",
    className
  )

  // If a wrapper is provided, clone it with the content
  if (wrapper) {
    return React.cloneElement(wrapper, {
      className: cn(wrapper.props.className, styles)
    }, content)
  }

  // If asLink is true and no wrapper is provided, wrap in Link
  if (asLink) {
    return (
      <Link href="/" className={styles}>
        {content}
      </Link>
    )
  }

  // Otherwise just return the content in a div
  return <div className={styles}>{content}</div>
} 