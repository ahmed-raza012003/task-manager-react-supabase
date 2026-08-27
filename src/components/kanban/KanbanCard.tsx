import { forwardRef } from 'react'
import { CheckSquare, Clock, Repeat } from 'lucide-react'
import { PriorityDot } from '@/components/common/PriorityDot'
import { LabelBadge } from '@/components/labels/LabelBadge'
import { ProgressBar } from '@/components/common/ProgressBar'
import { useChecklistItems } from '@/data/checklistItems'
import { useLabels } from '@/data/labels'
import { useUIStore } from '@/stores/uiStore'
import { friendlyDateLabel, formatMinutes, isPastDateKey, isTodayKey } from '@/lib/dateHelpers'
import { cn } from '@/lib/cn'
import type { Task } from '@/data/types'
import type { HTMLAttributes } from 'react'

interface KanbanCardProps extends HTMLAttributes<HTMLDivElement> {
  task: Task
  dragging?: boolean
}

export const KanbanCard = forwardRef<HTMLDivElement, KanbanCardProps>(({ task, dragging, className, ...rest }, ref) => {
  const checklist = useChecklistItems(task.id) ?? []
  const allLabels = useLabels() ?? []
  const openTaskPanel = useUIStore((s) => s.openTaskPanel)
  const taskLabels = allLabels.filter((l) => task.labelIds.includes(l.id))
  const done = task.status === 'done'
  const overdue = !done && isPastDateKey(task.dueDate)
  const dueToday = !done && isTodayKey(task.dueDate)
  const dueTone = overdue ? 'text-danger' : dueToday ? 'text-accent' : 'text-text-tertiary'

  return (
    <div
      ref={ref}
      data-task-id={task.id}
      tabIndex={0}
      onClick={() => openTaskPanel(task.id)}
      className={cn(
        'cursor-pointer rounded-lg border border-border-subtle bg-surface p-3 shadow-token-sm transition-all',
        'hover:-translate-y-0.5 hover:border-border-strong hover:shadow-token-md',
        'focus-visible:outline-none focus-visible:shadow-[var(--ring-accent)]',
        dragging && 'rotate-1 opacity-90 shadow-token-lg',
        className,
      )}
      {...rest}
    >
      {taskLabels.length > 0 && (
        <div className="mb-1.5 flex flex-wrap gap-1">
          {taskLabels.slice(0, 3).map((l) => (
            <LabelBadge key={l.id} label={l} />
          ))}
        </div>
      )}

      <div className="flex items-start gap-1.5">
        <PriorityDot priority={task.priority} className="mt-1" />
        <p className={cn('line-clamp-2 text-[13px] font-medium leading-snug text-text-primary', done && 'text-text-tertiary line-through')}>
          {task.title}
        </p>
      </div>

      {checklist.length > 0 && (
        <div className="mt-2 flex items-center gap-2">
          <ProgressBar value={(checklist.filter((c) => c.completed).length / checklist.length) * 100} className="flex-1" />
          <span className="whitespace-nowrap text-[11px] text-text-tertiary">
            {checklist.filter((c) => c.completed).length}/{checklist.length}
          </span>
        </div>
      )}

      <div className="mt-2.5 flex items-center justify-between border-t border-border-subtle pt-2 text-[11px] text-text-tertiary">
        <div className="flex items-center gap-2.5">
          {task.dueDate && (
            <span className={cn('font-medium', dueTone)}>{friendlyDateLabel(task.dueDate)}</span>
          )}
          {task.estimateMinutes && (
            <span className="flex items-center gap-0.5">
              <Clock className="h-3 w-3" />
              {formatMinutes(task.estimateMinutes)}
            </span>
          )}
          {task.recurrence && <Repeat className="h-3 w-3" />}
        </div>
        {checklist.length > 0 && (
          <span className="flex items-center gap-0.5">
            <CheckSquare className="h-3 w-3" />
            {checklist.length}
          </span>
        )}
      </div>
    </div>
  )
})
KanbanCard.displayName = 'KanbanCard'
