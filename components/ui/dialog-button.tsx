"use client"

import * as React from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DialogButtonProps extends React.ComponentProps<typeof Dialog.Root> {
  trigger: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function DialogButton({ trigger, children, className, ...props }: DialogButtonProps) {
  return (
    <Dialog.Root {...props}>
      <Dialog.Trigger asChild>
        {trigger}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className={cn(
          "fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]",
          "bg-white rounded-lg shadow-lg p-6",
          "focus:outline-none",
          className
        )}>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
} 