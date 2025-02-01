import Link from "next/link"
import { cn } from "@/lib/utils"

interface FooterLinkProps {
  href: string
  children: React.ReactNode
  className?: string
}

export function FooterLink({ href, children, className }: FooterLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "text-sm text-muted-foreground hover:text-primary transition-colors",
        className
      )}
    >
      {children}
    </Link>
  )
} 