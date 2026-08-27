import type { Label } from '@/data/types'
import { cn } from '@/lib/cn'

export function LabelBadge({ label, onRemove, className }: { label: Label; onRemove?: () => void; className?: string }) {
  return (
    <span
      className={cn('inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-[11px] font-medium leading-none', className)}
      style={{ backgroundColor: `${label.color}1A`, color: label.color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: label.color }} />
      {label.name}
      {onRemove && (
        <button onClick={onRemove} className="ml-0.5 opacity-60 hover:opacity-100" aria-label={`Remove ${label.name}`}>
          ×
        </button>
      )}
    </span>
  )
}
