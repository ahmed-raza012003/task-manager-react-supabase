import * as RadixCheckbox from '@radix-ui/react-checkbox'
import { Check } from 'lucide-react'
import { cn } from '@/lib/cn'

interface CheckboxProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  className?: string
  'aria-label'?: string
}

export function Checkbox({ checked, onCheckedChange, className, ...props }: CheckboxProps) {
  return (
    <RadixCheckbox.Root
      checked={checked}
      onCheckedChange={(v) => onCheckedChange(v === true)}
      className={cn(
        'flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border border-border-strong bg-surface transition-colors',
        'data-[state=checked]:border-accent data-[state=checked]:bg-accent',
        'focus-visible:outline-none',
        className,
      )}
      {...props}
    >
      <RadixCheckbox.Indicator>
        <Check className="h-3 w-3 text-white" strokeWidth={3} />
      </RadixCheckbox.Indicator>
    </RadixCheckbox.Root>
  )
}
