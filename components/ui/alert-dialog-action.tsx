"use client"

import * as React from "react"
import { AlertDialogAction as AlertDialogActionPrimitive } from "@radix-ui/react-alert-dialog"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export interface AlertDialogActionProps
  extends React.ComponentPropsWithoutRef<typeof AlertDialogActionPrimitive> {
  disabled?: boolean
}

const AlertDialogAction = React.forwardRef<
  React.ElementRef<typeof AlertDialogActionPrimitive>,
  AlertDialogActionProps
>(({ className, disabled, ...props }, ref) => (
  <AlertDialogActionPrimitive
    className={cn(buttonVariants(), className)}
    ref={ref}
    {...props}
    aria-disabled={disabled}
    data-disabled={disabled}
    style={
      disabled
        ? {
            pointerEvents: "none",
            opacity: 0.5,
          }
        : undefined
    }
  />
))
AlertDialogAction.displayName = AlertDialogActionPrimitive.displayName

export { AlertDialogAction } 