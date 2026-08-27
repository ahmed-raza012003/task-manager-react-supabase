import * as RadixTabs from '@radix-ui/react-tabs'
import { cn } from '@/lib/cn'
import type { ReactNode } from 'react'

export const TabsRoot = RadixTabs.Root

export function TabsList({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <RadixTabs.List className={cn('flex items-center gap-1 border-b border-border-subtle', className)}>
      {children}
    </RadixTabs.List>
  )
}

export function TabsTrigger({ value, children, className }: { value: string; children: ReactNode; className?: string }) {
  return (
    <RadixTabs.Trigger
      value={value}
      className={cn(
        'relative px-3 py-2 text-sm font-medium text-text-secondary outline-none transition-colors',
        'hover:text-text-primary data-[state=active]:text-text-primary',
        "data-[state=active]:after:absolute data-[state=active]:after:bottom-[-1px] data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-[2px] data-[state=active]:after:bg-accent data-[state=active]:after:content-['']",
        className,
      )}
    >
      {children}
    </RadixTabs.Trigger>
  )
}

export function TabsContent({ value, children, className }: { value: string; children: ReactNode; className?: string }) {
  return (
    <RadixTabs.Content value={value} className={cn('outline-none', className)}>
      {children}
    </RadixTabs.Content>
  )
}
