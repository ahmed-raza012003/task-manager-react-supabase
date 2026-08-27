import { Filter, Repeat, X } from 'lucide-react'
import { PopoverRoot, PopoverTrigger, PopoverContent } from '@/components/common/Popover'
import { Checkbox } from '@/components/common/Checkbox'
import { PriorityDot } from '@/components/common/PriorityDot'
import { useProjects } from '@/data/projects'
import { useLabels } from '@/data/labels'
import { priorityLabel } from '@/lib/colors'
import { cn } from '@/lib/cn'
import { DEFAULT_FILTERS, VIEW_LABELS, type TaskFilters, type TaskView } from './taskFilterTypes'
import type { Priority } from '@/data/types'

const VIEWS: TaskView[] = ['all', 'today', 'upcoming', 'overdue', 'completed', 'no-deadline']
const PRIORITIES: (Priority | 'any')[] = ['any', 'urgent', 'high', 'medium', 'low', null]

export function TaskFilterBar({ filters, onChange }: { filters: TaskFilters; onChange: (f: TaskFilters) => void }) {
  const projects = useProjects() ?? []
  const labels = useLabels() ?? []
  const activeAdvancedCount =
    (filters.projectId ? 1 : 0) + (filters.priority !== 'any' ? 1 : 0) + filters.labelIds.length + (filters.recurringOnly ? 1 : 0)

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex flex-wrap gap-1 rounded-lg bg-inset p-1">
        {VIEWS.map((v) => (
          <button
            key={v}
            onClick={() => onChange({ ...filters, view: v })}
            className={cn(
              'rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
              filters.view === v ? 'bg-surface text-text-primary shadow-token-sm' : 'text-text-secondary hover:text-text-primary',
            )}
          >
            {VIEW_LABELS[v]}
          </button>
        ))}
      </div>

      <PopoverRoot>
        <PopoverTrigger asChild>
          <button
            className={cn(
              'flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium',
              activeAdvancedCount > 0 ? 'border-accent bg-accent-subtle-bg text-accent-subtle-text' : 'border-border-subtle text-text-secondary hover:bg-hover',
            )}
          >
            <Filter className="h-3.5 w-3.5" /> Filters
            {activeAdvancedCount > 0 && <span className="rounded-full bg-accent px-1.5 text-[10px] text-white">{activeAdvancedCount}</span>}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3">
          <div className="mb-3">
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-text-tertiary">Project</p>
            <select
              value={filters.projectId ?? ''}
              onChange={(e) => onChange({ ...filters, projectId: e.target.value || null })}
              className="h-8 w-full rounded-md border border-border-subtle bg-surface px-2 text-sm text-text-primary outline-none"
            >
              <option value="">Any project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-text-tertiary">Priority</p>
            <div className="flex flex-wrap gap-1">
              {PRIORITIES.map((p) => (
                <button
                  key={p ?? 'none'}
                  onClick={() => onChange({ ...filters, priority: p })}
                  className={cn(
                    'flex items-center gap-1 rounded-md border px-2 py-1 text-xs',
                    filters.priority === p ? 'border-accent bg-accent-subtle-bg text-accent-subtle-text' : 'border-border-subtle text-text-secondary hover:bg-hover',
                  )}
                >
                  {p !== 'any' ? <PriorityDot priority={p} /> : null}
                  {p === 'any' ? 'Any' : priorityLabel(p)}
                </button>
              ))}
            </div>
          </div>

          {labels.length > 0 && (
            <div className="mb-3">
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-text-tertiary">Labels</p>
              <div className="max-h-32 space-y-1 overflow-y-auto">
                {labels.map((l) => (
                  <label key={l.id} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={filters.labelIds.includes(l.id)}
                      onCheckedChange={() =>
                        onChange({
                          ...filters,
                          labelIds: filters.labelIds.includes(l.id) ? filters.labelIds.filter((id) => id !== l.id) : [...filters.labelIds, l.id],
                        })
                      }
                    />
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: l.color }} />
                    {l.name}
                  </label>
                ))}
              </div>
            </div>
          )}

          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={filters.recurringOnly} onCheckedChange={(v) => onChange({ ...filters, recurringOnly: v })} />
            <Repeat className="h-3.5 w-3.5 text-text-tertiary" /> Recurring only
          </label>

          {activeAdvancedCount > 0 && (
            <button
              onClick={() => onChange({ ...filters, projectId: null, priority: 'any', labelIds: [], recurringOnly: false })}
              className="mt-3 flex items-center gap-1 text-xs font-medium text-text-tertiary hover:text-text-primary"
            >
              <X className="h-3 w-3" /> Clear filters
            </button>
          )}
        </PopoverContent>
      </PopoverRoot>

      {(filters.view !== 'all' || activeAdvancedCount > 0) && (
        <button onClick={() => onChange(DEFAULT_FILTERS)} className="text-xs font-medium text-text-tertiary hover:text-text-primary">
          Reset
        </button>
      )}
    </div>
  )
}
