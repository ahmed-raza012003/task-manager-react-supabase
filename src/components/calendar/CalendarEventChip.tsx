import { useDraggable } from '@dnd-kit/core'
import { PriorityDot } from '@/components/common/PriorityDot'
import { useUIStore } from '@/stores/uiStore'
import { cn } from '@/lib/cn'
import type { Task } from '@/data/types'

export function CalendarEventChip({ task, compact = true }: { task: Task; compact?: boolean }) {
  const openTaskPanel = useUIStore((s) => s.openTaskPanel)
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id, data: { task } })

  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 50 } : undefined

  return (
    <button
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => openTaskPanel(task.id)}
      className={cn(
        'flex w-full items-center gap-1 truncate rounded-sm bg-surface px-1.5 py-0.5 text-left text-[11px] font-medium text-text-primary shadow-token-sm hover:border-border-strong',
        'border border-border-subtle',
        task.status === 'done' && 'text-text-tertiary line-through opacity-70',
        isDragging && 'opacity-40',
        compact ? 'truncate' : '',
      )}
    >
      <PriorityDot priority={task.priority} />
      <span className="truncate">{task.title}</span>
    </button>
  )
}
