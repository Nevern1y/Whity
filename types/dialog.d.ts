import { DialogProps as RadixDialogProps } from '@radix-ui/react-dialog'

export interface DialogProps extends RadixDialogProps {
  title: string
  description?: string
} 