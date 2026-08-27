import { useMemo, useState } from 'react'
import { addDays, addMonths, addWeeks, format } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { CalendarGrid } from '@/components/calendar/CalendarGrid'
import { Button } from '@/components/common/Button'
import { useAllTasks } from '@/data/tasks'
import { useProjects } from '@/data/projects'
import { useSettings } from '@/data/settings'
import { cn } from '@/lib/cn'
import type { Priority } from '@/data/types'

type ViewMode = 'month' | 'week' | 'day'

export default function CalendarPage() {
  const [view, setView] = useState<ViewMode>('month')
  const [anchor, setAnchor] = useState(new Date())
  const [projectFilter, setProjectFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'any'>('any')

  const tasks = useAllTasks() ?? []
  const projects = useProjects() ?? []
  const settings = useSettings()

  const filtered = useMemo(
    () =>
      tasks.filter((t) => {
        if (projectFilter && t.projectId !== projectFilter) return false
        if (priorityFilter !== 'any' && t.priority !== priorityFilter) return false
        return true
      }),
    [tasks, projectFilter, priorityFilter],
  )

  const navigate = (dir: 1 | -1) => {
    if (view === 'month') setAnchor((d) => addMonths(d, dir))
    else if (view === 'week') setAnchor((d) => addWeeks(d, dir))
    else setAnchor((d) => addDays(d, dir))
  }

  const title =
    view === 'month' ? format(anchor, 'MMMM yyyy') : view === 'week' ? `Week of ${format(anchor, 'MMM d, yyyy')}` : format(anchor, 'EEEE, MMMM d')

  return (
    <div className="mx-auto max-w-6xl space-y-5 px-4 py-6 md:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold text-text-primary">Calendar</h1>
        <div className="flex items-center gap-2">
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="h-8 rounded-md border border-border-subtle bg-surface px-2 text-xs text-text-primary outline-none"
          >
            <option value="">All projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <select
            value={priorityFilter ?? 'none'}
            onChange={(e) => setPriorityFilter(e.target.value === 'any' ? 'any' : e.target.value === 'none' ? null : (e.target.value as Priority))}
            className="h-8 rounded-md border border-border-subtle bg-surface px-2 text-xs text-text-primary outline-none"
          >
            <option value="any">Any priority</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
            <option value="none">No priority</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setAnchor(new Date())}>
            Today
          </Button>
          <Button variant="secondary" size="icon" onClick={() => navigate(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <h2 className="ml-2 font-display text-lg font-semibold text-text-primary">{title}</h2>
        </div>
        <div className="flex gap-1 rounded-lg bg-inset p-1">
          {(['month', 'week', 'day'] as ViewMode[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                'rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors',
                view === v ? 'bg-surface text-text-primary shadow-token-sm' : 'text-text-secondary hover:text-text-primary',
              )}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <CalendarGrid view={view} anchorDate={anchor} tasks={filtered} weekStartsOn={settings?.startOfWeek ?? 1} />
    </div>
  )
}
