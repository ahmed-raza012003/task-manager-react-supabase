import { useMemo } from 'react'
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import { CalendarDayCell } from './CalendarDayCell'
import { CalendarEventChip } from './CalendarEventChip'
import { buildMonthGrid, buildWeekRow, toDateKey } from '@/lib/dateHelpers'
import { updateTask } from '@/data/tasks'
import { useQuickAddStore } from '@/stores/quickAddStore'
import type { Task } from '@/data/types'

const WEEKDAY_LABELS_MON = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const WEEKDAY_LABELS_SUN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function CalendarGrid({
  view,
  anchorDate,
  tasks,
  weekStartsOn,
}: {
  view: 'month' | 'week' | 'day'
  anchorDate: Date
  tasks: Task[]
  weekStartsOn: 0 | 1
}) {
  const openQuickAdd = useQuickAddStore((s) => s.open)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>()
    for (const t of tasks) {
      if (!t.dueDate) continue
      if (!map.has(t.dueDate)) map.set(t.dueDate, [])
      map.get(t.dueDate)!.push(t)
    }
    return map
  }, [tasks])

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over) return
    const dateKey = over.data.current?.dateKey as string | undefined
    if (!dateKey) return
    const task = active.data.current?.task as Task | undefined
    if (task && task.dueDate !== dateKey) {
      await updateTask(task.id, { dueDate: dateKey })
    }
  }

  if (view === 'day') {
    const dateKey = toDateKey(anchorDate)
    const dayTasks = (tasksByDate.get(dateKey) ?? []).sort((a, b) => (a.dueTime ?? '99:99').localeCompare(b.dueTime ?? '99:99'))
    return (
      <div className="mx-auto max-w-lg space-y-2">
        {dayTasks.length === 0 && <p className="py-10 text-center text-sm text-text-tertiary">Nothing scheduled for this day.</p>}
        {dayTasks.map((t) => (
          <div key={t.id} className="rounded-lg border border-border-subtle bg-surface p-3">
            <CalendarEventChip task={t} compact={false} />
          </div>
        ))}
        <button
          onClick={() => openQuickAdd({ dueDate: dateKey })}
          className="w-full rounded-lg border border-dashed border-border-strong py-2 text-sm text-text-tertiary hover:bg-hover hover:text-text-primary"
        >
          + Add task for this day
        </button>
      </div>
    )
  }

  const labels = weekStartsOn === 1 ? WEEKDAY_LABELS_MON : WEEKDAY_LABELS_SUN
  const cells =
    view === 'month'
      ? buildMonthGrid(anchorDate, weekStartsOn)
      : buildWeekRow(anchorDate, weekStartsOn).map((d) => ({ ...d, inMonth: true }))

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="overflow-hidden rounded-xl border-l border-t border-border-subtle">
        <div className="grid grid-cols-7 border-b border-border-subtle bg-inset/40">
          {labels.map((l) => (
            <div key={l} className="border-r border-border-subtle px-2 py-1.5 text-center text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">
              {l}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((cell) => (
            <CalendarDayCell
              key={cell.key}
              dateKey={cell.key}
              dayNumber={cell.date.getDate()}
              inMonth={cell.inMonth}
              isToday={cell.isToday}
              tasks={(tasksByDate.get(cell.key) ?? []).sort((a, b) => (a.dueTime ?? '99:99').localeCompare(b.dueTime ?? '99:99'))}
              onCreate={() => openQuickAdd({ dueDate: cell.key })}
            />
          ))}
        </div>
      </div>
    </DndContext>
  )
}
