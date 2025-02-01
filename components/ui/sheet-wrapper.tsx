import * as React from "react"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"

interface SheetWrapperProps {
  trigger: React.ReactNode
  children: React.ReactNode
  side?: "top" | "right" | "bottom" | "left"
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function SheetWrapper({ 
  trigger, 
  children, 
  side = "right",
  open,
  onOpenChange,
}: SheetWrapperProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        {trigger}
      </SheetTrigger>
      <SheetContent side={side}>
        {children}
      </SheetContent>
    </Sheet>
  )
} 