declare module '@radix-ui/react-dialog' {
  import * as React from 'react'
  
  interface DialogProps {
    open?: boolean
    defaultOpen?: boolean
    onOpenChange?: (open: boolean) => void
    modal?: boolean
    children?: React.ReactNode
  }

  interface DialogContentProps extends React.ComponentPropsWithoutRef<'div'> {
    forceMount?: true
    onCloseAutoFocus?: (event: Event) => void
    onEscapeKeyDown?: (event: KeyboardEvent) => void
    onInteractOutside?: (event: React.MouseEvent | React.TouchEvent) => void
    onPointerDownOutside?: (event: React.PointerEvent) => void
    children?: React.ReactNode
  }

  interface DialogTriggerProps extends React.ComponentPropsWithoutRef<'button'> {
    asChild?: boolean
    children?: React.ReactNode
  }

  export const Root: React.ForwardRefExoticComponent<DialogProps & React.RefAttributes<HTMLDivElement>>
  export const Trigger: React.ForwardRefExoticComponent<DialogTriggerProps & React.RefAttributes<HTMLButtonElement>>
  export const Portal: React.FC<{ children: React.ReactNode }>
  export const Overlay: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>
  export const Content: React.ForwardRefExoticComponent<DialogContentProps & React.RefAttributes<HTMLDivElement>>
  export const Title: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLHeadingElement> & React.RefAttributes<HTMLHeadingElement>>
  export const Description: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLParagraphElement> & React.RefAttributes<HTMLParagraphElement>>
  export const Close: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLButtonElement> & React.RefAttributes<HTMLButtonElement>>
}

declare module '@radix-ui/react-slot' {
  import * as React from 'react'

  interface SlotProps {
    children?: React.ReactNode
    asChild?: boolean
  }

  export const Slot: React.ForwardRefExoticComponent<
    SlotProps & React.HTMLAttributes<HTMLElement> & React.RefAttributes<HTMLElement>
  >
}

declare module '@radix-ui/react-dialog/dist/index' {
  export * from '@radix-ui/react-dialog'
} 