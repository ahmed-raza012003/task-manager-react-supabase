import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ListTodo } from 'lucide-react'
import { TaskCard } from '@/components/tasks/TaskCard'
import { TaskFilterBar } from '@/components/tasks/TaskFilterBar'
import { TaskSortMenu } from '@/components/tasks/TaskSortMenu'
import { EmptyState } from '@/components/common/EmptyState'
import { Button } from '@/components/common/Button'
import { useAllTasks } from '@/data/tasks'
import { useProjects } from '@/data/projects'
import { useQuickAddStore } from '@/stores/quickAddStore'
import { applyTaskFilters, sortTasks } from '@/lib/taskQuery'
import { DEFAULT_FILTERS, type TaskSortKey } from '@/components/tasks/taskFilterTypes'

export default function MyTasksPage() {
  const tasks = useAllTasks() ?? []
  const projects = useProjects() ?? []
  const openQuickAdd = useQuickAddStore((s) => s.open)
  const [searchParams] = useSearchParams()
  const initialLabel = searchParams.get('label')
  const [filters, setFilters] = useState(() => (initialLabel ? { ...DEFAULT_FILTERS, labelIds: [initialLabel] } : DEFAULT_FILTERS))
  const [sortKey, setSortKey] = useState<TaskSortKey>('dueDate')

  const filtered = useMemo(() => applyTaskFilters(tasks, filters), [tasks, filters])
  const sorted = useMemo(() => sortTasks(filtered, sortKey, projects), [filtered, sortKey, projects])

  return (
    <div className="mx-auto max-w-4xl space-y-5 px-4 py-6 md:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-text-primary">My Tasks</h1>
          <p className="mt-1 text-sm text-text-secondary">{sorted.length} task{sorted.length === 1 ? '' : 's'}</p>
        </div>
        <Button variant="primary" onClick={() => openQuickAdd()}>
          + New task
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <TaskFilterBar filters={filters} onChange={setFilters} />
        <TaskSortMenu value={sortKey} onChange={setSortKey} />
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          icon={<ListTodo className="h-6 w-6" />}
          title="No tasks match these filters"
          description="Try adjusting your filters, or create a new task."
          action={
            <button onClick={() => openQuickAdd()} className="text-sm font-medium text-accent hover:underline">
              + Create a task
            </button>
          }
        />
      ) : (
        <div className="space-y-2">
          {sorted.map((t) => (
            <TaskCard key={t.id} task={t} showProject />
          ))}
        </div>
      )}
    </div>
  )
}
