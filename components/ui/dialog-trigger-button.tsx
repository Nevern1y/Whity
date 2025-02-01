import * as React from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import type { ButtonProps } from "@/components/ui/button"
import type { DialogProps } from "@radix-ui/react-dialog"

interface DialogTriggerButtonProps extends ButtonProps {
  children: React.ReactNode
  dialogProps?: Omit<DialogProps, "children">
}

export function DialogTriggerButton({ 
  children, 
  dialogProps,
  ...buttonProps 
}: DialogTriggerButtonProps) {
  return (
    <Dialog {...dialogProps}>
      <DialogTrigger asChild>
        <Button {...buttonProps}>
          {children}
        </Button>
      </DialogTrigger>
    </Dialog>
  )
} 