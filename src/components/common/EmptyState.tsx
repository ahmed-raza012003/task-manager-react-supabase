import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border-subtle px-6 py-14 text-center', className)}>
      {icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-subtle-bg text-accent">
          {icon}
        </div>
      )}
      <div className="space-y-1">
        <p className="font-display text-base font-semibold text-text-primary">{title}</p>
        {description && <p className="max-w-xs text-sm text-text-secondary">{description}</p>}
      </div>
      {action}
    </div>
  )
}
