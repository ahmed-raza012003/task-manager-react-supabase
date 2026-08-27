import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

type Tone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone
}

const toneClasses: Record<Tone, string> = {
  neutral: 'bg-inset text-text-secondary',
  accent: 'bg-accent-subtle-bg text-accent-subtle-text',
  success: 'bg-success-subtle-bg text-success',
  warning: 'bg-warning-subtle-bg text-warning',
  danger: 'bg-danger-subtle-bg text-danger',
}

export function Badge({ tone = 'neutral', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-[11px] font-medium leading-none',
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  )
}
