import * as React from "react"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import type { DialogProps } from "@radix-ui/react-dialog"

interface CustomDialogTriggerProps {
  children: React.ReactNode
  trigger: React.ReactNode
  dialogProps?: Omit<DialogProps, "children">
}

export function CustomDialogTrigger({ 
  children, 
  trigger,
  dialogProps 
}: CustomDialogTriggerProps) {
  return (
    <Dialog {...dialogProps}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      {children}
    </Dialog>
  )
} 