import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import type { ButtonProps } from "@/components/ui/button"

interface LinkButtonProps extends ButtonProps {
  href: string
  children: React.ReactNode
}

export function LinkButton({ href, children, ...props }: LinkButtonProps) {
  return (
    <Link href={href} passHref>
      <Button {...props}>
        {children}
      </Button>
    </Link>
  )
} 