import * as RadixDialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { ReactNode } from 'react'

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
  className?: string
  showClose?: boolean
}

export function Dialog({ open, onOpenChange, children, className, showClose = true }: DialogProps) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] data-[state=open]:animate-[fadeIn_150ms_ease-out]" />
        <RadixDialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2',
            'rounded-xl border border-border-subtle bg-surface-raised shadow-token-lg',
            'data-[state=open]:animate-[scaleIn_150ms_ease-out] focus:outline-none',
            className,
          )}
        >
          {children}
          {showClose && (
            <RadixDialog.Close asChild>
              <button
                className="absolute right-4 top-4 rounded-md p-1 text-text-tertiary hover:bg-hover hover:text-text-primary"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </RadixDialog.Close>
          )}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  )
}

export const DialogTitle = RadixDialog.Title
export const DialogDescription = RadixDialog.Description
export const DialogClose = RadixDialog.Close
