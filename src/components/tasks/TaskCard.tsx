import { CheckSquare, Clock, MoreHorizontal, Repeat } from 'lucide-react'
import { Checkbox } from '@/components/common/Checkbox'
import { PriorityDot } from '@/components/common/PriorityDot'
import { LabelBadge } from '@/components/labels/LabelBadge'
import {
  DropdownMenuRoot,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/common/DropdownMenu'
import { completeTask, uncompleteTask, duplicateTask, archiveTask, trashTask } from '@/data/tasks'
import { useChecklistItems } from '@/data/checklistItems'
import { useLabels } from '@/data/labels'
import { useProject } from '@/data/projects'
import { useUIStore } from '@/stores/uiStore'
import { friendlyDateLabel, isPastDateKey, isTodayKey } from '@/lib/dateHelpers'
import { formatMinutes } from '@/lib/dateHelpers'
import { cn } from '@/lib/cn'
import type { Task } from '@/data/types'
import { toast } from '@/stores/toastStore'

interface TaskCardProps {
  task: Task
  showProject?: boolean
  dragHandleProps?: Record<string, unknown>
  className?: string
}

export function TaskCard({ task, showProject = false, dragHandleProps, className }: TaskCardProps) {
  const checklist = useChecklistItems(task.id) ?? []
  const allLabels = useLabels() ?? []
  const project = useProject(showProject ? task.projectId : null)
  const openTaskPanel = useUIStore((s) => s.openTaskPanel)

  const taskLabels = allLabels.filter((l) => task.labelIds.includes(l.id))
  const done = task.status === 'done'
  const overdue = !done && isPastDateKey(task.dueDate)
  const dueToday = !done && isTodayKey(task.dueDate)

  const dueTone = overdue ? 'text-danger' : dueToday ? 'text-accent' : 'text-text-tertiary'

  return (
    <div
      data-task-id={task.id}
      tabIndex={0}
      className={cn(
        'group flex items-start gap-3 rounded-lg border border-border-subtle bg-surface px-3 py-2.5 transition-all',
        'hover:border-border-strong hover:shadow-token-sm focus-visible:outline-none focus-visible:shadow-[var(--ring-accent)]',
        done && 'opacity-60',
        className,
      )}
      {...dragHandleProps}
    >
      <div className="pt-0.5">
        <Checkbox
          checked={done}
          onCheckedChange={async (checked) => {
            if (checked) {
              const { nextTask } = await completeTask(task.id)
              if (nextTask) toast('Task completed', `Next occurrence scheduled for ${friendlyDateLabel(nextTask.dueDate)}`)
            } else {
              await uncompleteTask(task.id)
            }
          }}
        />
      </div>

      <button className="min-w-0 flex-1 text-left" onClick={() => openTaskPanel(task.id)}>
        <div className="flex items-center gap-1.5">
          <PriorityDot priority={task.priority} />
          <p className={cn('truncate text-sm font-medium text-text-primary', done && 'line-through')}>{task.title}</p>
          {task.recurrence && <Repeat className="h-3 w-3 shrink-0 text-text-tertiary" />}
        </div>

        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-tertiary">
          {task.dueDate && (
            <span className={cn('font-medium', dueTone)}>
              {friendlyDateLabel(task.dueDate)}
              {task.dueTime ? ` · ${task.dueTime}` : ''}
            </span>
          )}
          {showProject && project && (
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: project.color }} />
              {project.name}
            </span>
          )}
          {checklist.length > 0 && (
            <span className="flex items-center gap-1">
              <CheckSquare className="h-3 w-3" />
              {checklist.filter((c) => c.completed).length}/{checklist.length}
            </span>
          )}
          {task.estimateMinutes && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatMinutes(task.estimateMinutes)}
            </span>
          )}
          {taskLabels.slice(0, 3).map((l) => (
            <LabelBadge key={l.id} label={l} />
          ))}
          {taskLabels.length > 3 && <span>+{taskLabels.length - 3}</span>}
        </div>
      </button>

      <DropdownMenuRoot>
        <DropdownMenuTrigger asChild>
          <button className="rounded-md p-1 text-text-tertiary opacity-0 transition-opacity hover:bg-hover hover:text-text-primary group-hover:opacity-100 group-focus-within:opacity-100">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => openTaskPanel(task.id)}>Open</DropdownMenuItem>
          <DropdownMenuItem onSelect={async () => { await duplicateTask(task.id); toast('Task duplicated') }}>Duplicate</DropdownMenuItem>
          <DropdownMenuItem onSelect={async () => { await archiveTask(task.id, true); toast('Task archived') }}>Archive</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            danger
            onSelect={async () => {
              await trashTask(task.id)
              toast('Task moved to trash')
            }}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenuRoot>
    </div>
  )
}
