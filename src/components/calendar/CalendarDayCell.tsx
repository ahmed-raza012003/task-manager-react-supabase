import { useDroppable } from '@dnd-kit/core'
import { Plus } from 'lucide-react'
import { CalendarEventChip } from './CalendarEventChip'
import { cn } from '@/lib/cn'
import type { Task } from '@/data/types'

export function CalendarDayCell({
  dateKey,
  dayNumber,
  inMonth,
  isToday,
  tasks,
  onCreate,
}: {
  dateKey: string
  dayNumber: number
  inMonth: boolean
  isToday: boolean
  tasks: Task[]
  onCreate: () => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `day-${dateKey}`, data: { dateKey } })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'group flex min-h-[110px] flex-col gap-1 border-b border-r border-border-subtle p-1.5 transition-colors',
        !inMonth && 'bg-inset/40',
        isOver && 'bg-accent-subtle-bg',
      )}
    >
      <div className="flex items-center justify-between">
        <span
          className={cn(
            'flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-semibold',
            isToday ? 'bg-accent text-white' : inMonth ? 'text-text-primary' : 'text-text-tertiary',
          )}
        >
          {dayNumber}
        </span>
        <button
          onClick={onCreate}
          className="rounded p-0.5 text-text-tertiary opacity-0 hover:bg-hover hover:text-text-primary group-hover:opacity-100"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="flex-1 space-y-1 overflow-y-auto">
        {tasks.slice(0, 4).map((t) => (
          <CalendarEventChip key={t.id} task={t} />
        ))}
        {tasks.length > 4 && <p className="px-1 text-[10px] text-text-tertiary">+{tasks.length - 4} more</p>}
      </div>
    </div>
  )
}
