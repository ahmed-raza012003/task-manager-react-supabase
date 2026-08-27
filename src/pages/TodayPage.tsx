import { useMemo } from 'react'
import { DndContext, PointerSensor, useDraggable, useDroppable, useSensor, useSensors } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import { CloudSun, Flame, Moon, Sunrise, Zap } from 'lucide-react'
import { TaskCard } from '@/components/tasks/TaskCard'
import { EmptyState } from '@/components/common/EmptyState'
import { useAllTasks, updateTask } from '@/data/tasks'
import { todayKey, formatFullDate, isPastDateKey, isTodayKey } from '@/lib/dateHelpers'
import { useQuickAddStore } from '@/stores/quickAddStore'
import { cn } from '@/lib/cn'
import type { Task, TimeOfDay } from '@/data/types'

type SectionKey = 'morning' | 'afternoon' | 'evening' | 'quick' | 'overdue'

const SECTION_META: Record<SectionKey, { label: string; icon: React.ReactNode }> = {
  morning: { label: 'Morning', icon: <Sunrise className="h-4 w-4" /> },
  afternoon: { label: 'Afternoon', icon: <CloudSun className="h-4 w-4" /> },
  evening: { label: 'Evening', icon: <Moon className="h-4 w-4" /> },
  quick: { label: 'Quick Tasks', icon: <Zap className="h-4 w-4" /> },
  overdue: { label: 'Overdue', icon: <Flame className="h-4 w-4" /> },
}

export default function TodayPage() {
  const tasks = useAllTasks() ?? []
  const openQuickAdd = useQuickAddStore((s) => s.open)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const sections = useMemo(() => {
    const grouped: Record<SectionKey, Task[]> = { morning: [], afternoon: [], evening: [], quick: [], overdue: [] }
    for (const t of tasks) {
      if (t.status === 'done') continue
      if (isPastDateKey(t.dueDate)) {
        grouped.overdue.push(t)
      } else if (isTodayKey(t.dueDate)) {
        if (t.timeOfDay === 'morning') grouped.morning.push(t)
        else if (t.timeOfDay === 'afternoon') grouped.afternoon.push(t)
        else if (t.timeOfDay === 'evening') grouped.evening.push(t)
        else grouped.quick.push(t)
      }
    }
    return grouped
  }, [tasks])

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over) return
    const section = over.id as SectionKey
    const task = active.data.current?.task as Task | undefined
    if (!task) return

    if (section === 'overdue') return

    const patch: Partial<Task> = { timeOfDay: section === 'quick' ? null : (section as TimeOfDay) }
    if (!isTodayKey(task.dueDate)) patch.dueDate = todayKey()
    await updateTask(task.id, patch)
  }

  const totalOpen = sections.morning.length + sections.afternoon.length + sections.evening.length + sections.quick.length + sections.overdue.length

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 md:px-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-text-primary">Today</h1>
        <p className="mt-1 text-sm text-text-secondary">{formatFullDate()}</p>
      </div>

      {totalOpen === 0 ? (
        <EmptyState
          icon={<Zap className="h-6 w-6" />}
          title="You're clear."
          description="Nothing is waiting for you here."
          action={
            <button onClick={() => openQuickAdd({ dueDate: todayKey() })} className="text-sm font-medium text-accent hover:underline">
              + Add a task for today
            </button>
          }
        />
      ) : (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="space-y-6">
            {sections.overdue.length > 0 && <Section sectionKey="overdue" tasks={sections.overdue} droppable={false} />}
            <Section sectionKey="morning" tasks={sections.morning} onAdd={() => openQuickAdd({ dueDate: todayKey() })} />
            <Section sectionKey="afternoon" tasks={sections.afternoon} onAdd={() => openQuickAdd({ dueDate: todayKey() })} />
            <Section sectionKey="evening" tasks={sections.evening} onAdd={() => openQuickAdd({ dueDate: todayKey() })} />
            <Section sectionKey="quick" tasks={sections.quick} onAdd={() => openQuickAdd({ dueDate: todayKey() })} />
          </div>
        </DndContext>
      )}
    </div>
  )
}

function Section({
  sectionKey,
  tasks,
  droppable = true,
  onAdd,
}: {
  sectionKey: SectionKey
  tasks: Task[]
  droppable?: boolean
  onAdd?: () => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: sectionKey, disabled: !droppable })
  const meta = SECTION_META[sectionKey]

  return (
    <section>
      <div className="mb-2.5 flex items-center justify-between">
        <h2 className={cn('flex items-center gap-2 font-display text-sm font-semibold', sectionKey === 'overdue' ? 'text-danger' : 'text-text-primary')}>
          {meta.icon} {meta.label}
          <span className="rounded-full bg-inset px-1.5 py-0.5 text-[11px] font-medium text-text-tertiary">{tasks.length}</span>
        </h2>
        {onAdd && (
          <button onClick={onAdd} className="text-xs font-medium text-text-tertiary hover:text-accent">
            + Add task
          </button>
        )}
      </div>
      <div ref={setNodeRef} className={cn('min-h-[52px] space-y-2 rounded-xl transition-colors', isOver && 'bg-accent-subtle-bg/50 ring-2 ring-accent/30')}>
        {tasks.length === 0 && <p className="rounded-lg border border-dashed border-border-subtle px-3 py-3 text-xs text-text-tertiary">Nothing here — drag a task in.</p>}
        {tasks.map((t) => (
          <DraggableTaskRow key={t.id} task={t} />
        ))}
      </div>
    </section>
  )
}

function DraggableTaskRow({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id, data: { task } })
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 30, position: 'relative' as const }
    : undefined

  return (
    <div ref={setNodeRef} style={style} className={cn(isDragging && 'opacity-50')}>
      <TaskCard task={task} showProject dragHandleProps={{ ...attributes, ...listeners }} />
    </div>
  )
}
