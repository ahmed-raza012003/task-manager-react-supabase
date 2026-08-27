import { ArrowUpDown } from 'lucide-react'
import { DropdownMenuRoot, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/common/DropdownMenu'
import type { TaskSortKey } from './taskFilterTypes'

const SORT_LABELS: Record<TaskSortKey, string> = {
  priority: 'Priority',
  dueDate: 'Deadline',
  created: 'Created date',
  alphabetical: 'Alphabetical',
  project: 'Project',
}

export function TaskSortMenu({ value, onChange }: { value: TaskSortKey; onChange: (v: TaskSortKey) => void }) {
  return (
    <DropdownMenuRoot>
      <DropdownMenuTrigger asChild>
        <button className="flex h-8 items-center gap-1.5 rounded-md border border-border-subtle px-2.5 text-xs font-medium text-text-secondary hover:bg-hover">
          <ArrowUpDown className="h-3.5 w-3.5" /> {SORT_LABELS[value]}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {(Object.keys(SORT_LABELS) as TaskSortKey[]).map((key) => (
          <DropdownMenuItem key={key} onSelect={() => onChange(key)}>
            {SORT_LABELS[key]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenuRoot>
  )
}
