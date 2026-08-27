import * as RadixSelect from '@radix-ui/react-select'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { ReactNode } from 'react'

interface SelectOption {
  value: string
  label: ReactNode
}

export function Select({
  value,
  onValueChange,
  options,
  placeholder,
  className,
}: {
  value: string
  onValueChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  className?: string
}) {
  return (
    <RadixSelect.Root value={value} onValueChange={onValueChange}>
      <RadixSelect.Trigger
        className={cn(
          'flex h-9 w-full items-center justify-between gap-2 rounded-md border border-border-subtle bg-surface px-3 text-sm text-text-primary',
          'focus-visible:outline-none focus-visible:border-accent focus-visible:shadow-[var(--ring-accent)]',
          className,
        )}
      >
        <RadixSelect.Value placeholder={placeholder} />
        <RadixSelect.Icon>
          <ChevronDown className="h-3.5 w-3.5 text-text-tertiary" />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content
          position="popper"
          sideOffset={6}
          className="z-50 max-h-64 min-w-[var(--radix-select-trigger-width)] overflow-auto rounded-lg border border-border-subtle bg-surface-raised p-1.5 shadow-token-lg"
        >
          <RadixSelect.Viewport>
            {options.map((opt) => (
              <RadixSelect.Item
                key={opt.value}
                value={opt.value}
                className="flex cursor-pointer items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-sm text-text-primary outline-none data-[highlighted]:bg-hover"
              >
                <RadixSelect.ItemText>{opt.label}</RadixSelect.ItemText>
                <RadixSelect.ItemIndicator>
                  <Check className="h-3.5 w-3.5 text-accent" />
                </RadixSelect.ItemIndicator>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  )
}
