import type { Priority } from '@/data/types'
import { priorityColor, priorityLabel } from '@/lib/colors'
import { cn } from '@/lib/cn'

export function PriorityDot({ priority, className, showLabel }: { priority: Priority; className?: string; showLabel?: boolean }) {
  if (!priority) return null
  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: priorityColor(priority) }} />
      {showLabel && <span className="text-xs text-text-secondary">{priorityLabel(priority)}</span>}
    </span>
  )
}
