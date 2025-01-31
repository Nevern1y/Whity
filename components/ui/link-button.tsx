import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { ButtonProps } from "@/components/ui/button"

interface LinkButtonProps extends ButtonProps {
  href: string
}

export function LinkButton({ href, className, children, ...props }: LinkButtonProps) {
  return (
    <Link href={href} className={cn("block", className)}>
      <Button {...props}>{children}</Button>
    </Link>
  )
} 