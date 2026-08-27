import * as RadixPopover from '@radix-ui/react-popover'
import { cn } from '@/lib/cn'
import type { ReactNode } from 'react'

export const PopoverRoot = RadixPopover.Root
export const PopoverTrigger = RadixPopover.Trigger
export const PopoverAnchor = RadixPopover.Anchor

export function PopoverContent({
  children,
  className,
  align = 'start',
  sideOffset = 6,
}: {
  children: ReactNode
  className?: string
  align?: 'start' | 'center' | 'end'
  sideOffset?: number
}) {
  return (
    <RadixPopover.Portal>
      <RadixPopover.Content
        align={align}
        sideOffset={sideOffset}
        className={cn(
          'z-50 rounded-lg border border-border-subtle bg-surface-raised p-1.5 shadow-token-lg',
          'data-[state=open]:animate-[fadeIn_120ms_ease-out] focus:outline-none',
          className,
        )}
      >
        {children}
      </RadixPopover.Content>
    </RadixPopover.Portal>
  )
}
