import Link from "next/link"
import { Button } from "@/components/ui/button"
import { type ButtonProps } from "@/components/ui/button"
import { type LucideIcon } from "lucide-react"

interface IconLinkButtonProps extends ButtonProps {
  href: string
  icon: LucideIcon
  children: React.ReactNode
}

export function IconLinkButton({ 
  href, 
  icon: Icon, 
  children, 
  ...props 
}: IconLinkButtonProps) {
  return (
    <Link href={href} passHref>
      <Button {...props}>
        <Icon className="mr-2 h-4 w-4" />
        {children}
      </Button>
    </Link>
  )
} 