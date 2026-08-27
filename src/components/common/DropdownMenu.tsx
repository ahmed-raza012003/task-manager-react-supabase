import * as RadixDropdown from '@radix-ui/react-dropdown-menu'
import { Check, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { ReactNode } from 'react'

export const DropdownMenuRoot = RadixDropdown.Root
export const DropdownMenuTrigger = RadixDropdown.Trigger
export const DropdownMenuSub = RadixDropdown.Sub
export const DropdownMenuSubTrigger = ({ children, className }: { children: ReactNode; className?: string }) => (
  <RadixDropdown.SubTrigger
    className={cn(
      'flex cursor-pointer items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-sm text-text-primary outline-none',
      'data-[highlighted]:bg-hover data-[state=open]:bg-hover',
      className,
    )}
  >
    {children}
    <ChevronRight className="h-3.5 w-3.5 text-text-tertiary" />
  </RadixDropdown.SubTrigger>
)

export function DropdownMenuContent({ children, className, align = 'start' }: { children: ReactNode; className?: string; align?: 'start' | 'center' | 'end' }) {
  return (
    <RadixDropdown.Portal>
      <RadixDropdown.Content
        align={align}
        sideOffset={6}
        className={cn(
          'z-50 min-w-[180px] rounded-lg border border-border-subtle bg-surface-raised p-1.5 shadow-token-lg',
          'data-[state=open]:animate-[fadeIn_120ms_ease-out] focus:outline-none',
          className,
        )}
      >
        {children}
      </RadixDropdown.Content>
    </RadixDropdown.Portal>
  )
}

export const DropdownMenuSubContent = ({ children, className }: { children: ReactNode; className?: string }) => (
  <RadixDropdown.Portal>
    <RadixDropdown.SubContent
      sideOffset={4}
      className={cn(
        'z-50 min-w-[160px] rounded-lg border border-border-subtle bg-surface-raised p-1.5 shadow-token-lg',
        'data-[state=open]:animate-[fadeIn_120ms_ease-out] focus:outline-none',
        className,
      )}
    >
      {children}
    </RadixDropdown.SubContent>
  </RadixDropdown.Portal>
)

export function DropdownMenuItem({
  children,
  className,
  onSelect,
  danger,
  disabled,
}: {
  children: ReactNode
  className?: string
  onSelect?: (e: Event) => void
  danger?: boolean
  disabled?: boolean
}) {
  return (
    <RadixDropdown.Item
      onSelect={onSelect}
      disabled={disabled}
      className={cn(
        'flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-sm outline-none transition-colors',
        danger ? 'text-danger data-[highlighted]:bg-danger-subtle-bg' : 'text-text-primary data-[highlighted]:bg-hover',
        'data-[disabled]:opacity-40 data-[disabled]:pointer-events-none',
        className,
      )}
    >
      {children}
    </RadixDropdown.Item>
  )
}

export function DropdownMenuCheckboxItem({
  children,
  checked,
  onCheckedChange,
  className,
}: {
  children: ReactNode
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  className?: string
}) {
  return (
    <RadixDropdown.CheckboxItem
      checked={checked}
      onCheckedChange={onCheckedChange}
      onSelect={(e) => e.preventDefault()}
      className={cn(
        'flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-text-primary outline-none data-[highlighted]:bg-hover',
        className,
      )}
    >
      <span className="flex h-3.5 w-3.5 items-center justify-center">
        <RadixDropdown.ItemIndicator>
          <Check className="h-3.5 w-3.5 text-accent" />
        </RadixDropdown.ItemIndicator>
      </span>
      {children}
    </RadixDropdown.CheckboxItem>
  )
}

export function DropdownMenuLabel({ children }: { children: ReactNode }) {
  return <div className="px-2.5 pb-1 pt-1.5 text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">{children}</div>
}

export function DropdownMenuSeparator() {
  return <RadixDropdown.Separator className="my-1 h-px bg-border-subtle" />
}
