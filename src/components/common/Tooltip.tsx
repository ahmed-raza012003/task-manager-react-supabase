import * as RadixTooltip from '@radix-ui/react-tooltip'
import type { ReactNode } from 'react'

export function TooltipProvider({ children }: { children: ReactNode }) {
  return (
    <RadixTooltip.Provider delayDuration={400} skipDelayDuration={200}>
      {children}
    </RadixTooltip.Provider>
  )
}

export function Tooltip({ content, children, side = 'top' }: { content: ReactNode; children: ReactNode; side?: 'top' | 'bottom' | 'left' | 'right' }) {
  if (!content) return <>{children}</>
  return (
    <RadixTooltip.Root>
      <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content
          side={side}
          sideOffset={6}
          className="z-50 rounded-md bg-[#1C1B1A] px-2 py-1 text-xs font-medium text-white shadow-token-md data-[state=delayed-open]:animate-[fadeIn_120ms_ease-out]"
        >
          {content}
          <RadixTooltip.Arrow className="fill-[#1C1B1A]" />
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  )
}
