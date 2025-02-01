import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import * as DialogPrimitive from "@radix-ui/react-dialog"

interface DialogWrapperProps {
  trigger: React.ReactNode
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function DialogWrapper({ 
  trigger, 
  children,
  open,
  onOpenChange,
}: DialogWrapperProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent>
        {children}
      </DialogContent>
    </Dialog>
  )
} 