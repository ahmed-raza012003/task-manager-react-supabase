import { useEffect, useState } from 'react'
import * as RadixDialog from '@radix-ui/react-dialog'
import {
  X,
  Copy,
  Archive,
  Trash2,
  Play,
  Square,
  Clock,
  FolderKanban,
  Tag as TagIcon,
  StickyNote,
  History,
} from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'
import { useTask, updateTask, completeTask, uncompleteTask, duplicateTask, archiveTask, trashTask, moveTaskToProject } from '@/data/tasks'
import { useKanbanColumns } from '@/data/kanbanColumns'
import { useProjects } from '@/data/projects'
import { useLabels } from '@/data/labels'
import { useEntityActivity } from '@/data/activityLog'
import { useNotes, createNote, updateNote } from '@/data/notes'
import { useRunningTimer, useTaskTrackedSeconds, startTimer, stopAnyRunningTimer } from '@/data/timeEntries'
import { ChecklistEditor } from './ChecklistEditor'
import { RecurrencePicker } from './RecurrencePicker'
import { LabelPicker } from '@/components/labels/LabelPicker'
import { LabelBadge } from '@/components/labels/LabelBadge'
import { Textarea } from '@/components/common/Input'
import { Button } from '@/components/common/Button'
import { PriorityDot } from '@/components/common/PriorityDot'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import {
  DropdownMenuRoot,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/common/DropdownMenu'
import { formatDuration, friendlyDateLabel } from '@/lib/dateHelpers'
import { priorityLabel } from '@/lib/colors'
import { useIsMobile } from '@/hooks/useMediaQuery'
import { toast } from '@/stores/toastStore'
import { cn } from '@/lib/cn'
import type { Priority } from '@/data/types'

const PRIORITIES: Priority[] = ['urgent', 'high', 'medium', 'low', null]

export function TaskDetailPanel() {
  const taskId = useUIStore((s) => s.selectedTaskId)
  const close = useUIStore((s) => s.closeTaskPanel)
  const isMobile = useIsMobile()

  return (
    <RadixDialog.Root open={!!taskId} onOpenChange={(open) => !open && close()}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px] data-[state=open]:animate-[fadeIn_150ms_ease-out]" />
        <RadixDialog.Content
          className={cn(
            'fixed z-50 flex flex-col bg-surface-raised shadow-token-lg focus:outline-none',
            isMobile
              ? 'inset-x-0 bottom-0 top-12 rounded-t-2xl data-[state=open]:animate-[slideUpSheet_220ms_ease-out]'
              : 'inset-y-0 right-0 w-full max-w-[440px] border-l border-border-subtle data-[state=open]:animate-[slideInRight_220ms_ease-out]',
          )}
        >
          {taskId && <PanelBody taskId={taskId} onClose={close} />}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  )
}

function PanelBody({ taskId, onClose }: { taskId: string; onClose: () => void }) {
  const task = useTask(taskId)
  const columns = useKanbanColumns(task?.projectId ?? null) ?? []
  const projects = useProjects() ?? []
  const allLabels = useLabels() ?? []
  const activity = useEntityActivity('task', taskId) ?? []
  const notes = useNotes({ taskId }) ?? []
  const runningTimer = useRunningTimer()
  const trackedSeconds = useTaskTrackedSeconds(taskId)
  const isMobile = useIsMobile()

  const [title, setTitle] = useState(task?.title ?? '')
  const [description, setDescription] = useState(task?.description ?? '')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [, setTick] = useState(0)

  useEffect(() => setTitle(task?.title ?? ''), [task?.id, task?.title])
  useEffect(() => setDescription(task?.description ?? ''), [task?.id, task?.description])

  const isRunningThisTask = runningTimer?.taskId === taskId
  useEffect(() => {
    if (!isRunningThisTask) return
    const i = window.setInterval(() => setTick((t) => t + 1), 1000)
    return () => window.clearInterval(i)
  }, [isRunningThisTask])

  if (!task) return null

  const liveElapsed = isRunningThisTask && runningTimer ? Math.floor((Date.now() - new Date(runningTimer.startedAt).getTime()) / 1000) : 0

  const commitTitle = () => title.trim() && title.trim() !== task.title && updateTask(task.id, { title: title.trim() })
  const commitDescription = () => description !== task.description && updateTask(task.id, { description })

  return (
    <>
      <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={async () => {
              if (task.status === 'done') {
                await uncompleteTask(task.id)
              } else {
                const { nextTask } = await completeTask(task.id)
                if (nextTask) toast('Task completed', `Next occurrence: ${friendlyDateLabel(nextTask.dueDate)}`)
                else onClose()
              }
            }}
            className={cn(
              'rounded-md px-2.5 py-1 text-xs font-semibold',
              task.status === 'done' ? 'bg-success-subtle-bg text-success' : 'bg-accent-subtle-bg text-accent-subtle-text hover:bg-accent/20',
            )}
          >
            {task.status === 'done' ? 'Completed' : 'Mark complete'}
          </button>
        </div>
        <div className="flex items-center gap-1">
          <DropdownMenuRoot>
            <DropdownMenuTrigger asChild>
              <button className="rounded-md p-1.5 text-text-tertiary hover:bg-hover hover:text-text-primary">
                <Copy className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={async () => { await duplicateTask(task.id); toast('Task duplicated') }}>
                <Copy className="h-3.5 w-3.5" /> Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={async () => { await archiveTask(task.id, true); toast('Task archived'); onClose() }}>
                <Archive className="h-3.5 w-3.5" /> Archive
              </DropdownMenuItem>
              <DropdownMenuItem danger onSelect={() => setConfirmDelete(true)}>
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenuRoot>
          <RadixDialog.Close asChild>
            <button className="rounded-md p-1.5 text-text-tertiary hover:bg-hover hover:text-text-primary">
              <X className="h-4 w-4" />
            </button>
          </RadixDialog.Close>
        </div>
      </div>

      <div className={cn('flex-1 overflow-y-auto px-4 py-4', isMobile && 'pb-24')}>
        <textarea
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={commitTitle}
          rows={1}
          className={cn(
            'w-full resize-none bg-transparent font-display text-lg font-semibold text-text-primary outline-none',
            task.status === 'done' && 'text-text-tertiary line-through',
          )}
        />

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <DropdownMenuRoot>
            <DropdownMenuTrigger asChild>
              <button className="flex h-7 items-center gap-1.5 rounded-md border border-border-subtle px-2 text-xs font-medium text-text-secondary hover:bg-hover">
                <PriorityDot priority={task.priority} /> {priorityLabel(task.priority)}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {PRIORITIES.map((p) => (
                <DropdownMenuItem key={p ?? 'none'} onSelect={() => updateTask(task.id, { priority: p })}>
                  <PriorityDot priority={p} showLabel />
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenuRoot>

          <label className="flex h-7 items-center gap-1.5 rounded-md border border-border-subtle px-2 text-xs font-medium text-text-secondary hover:bg-hover">
            Due
            <input
              type="date"
              value={task.dueDate ?? ''}
              onChange={(e) => updateTask(task.id, { dueDate: e.target.value || null })}
              className="bg-transparent text-text-primary outline-none"
            />
          </label>

          <label className="flex h-7 items-center gap-1.5 rounded-md border border-border-subtle px-2 text-xs font-medium text-text-secondary hover:bg-hover">
            Time
            <input
              type="time"
              value={task.dueTime ?? ''}
              onChange={(e) => updateTask(task.id, { dueTime: e.target.value || null })}
              className="bg-transparent text-text-primary outline-none"
            />
          </label>

          <RecurrencePicker value={task.recurrence} onChange={(rule) => updateTask(task.id, { recurrence: rule })} />

          <label className="flex h-7 items-center gap-1.5 rounded-md border border-border-subtle px-2 text-xs font-medium text-text-secondary hover:bg-hover">
            <Clock className="h-3.5 w-3.5" />
            <input
              type="number"
              min={0}
              placeholder="Est. min"
              value={task.estimateMinutes ?? ''}
              onChange={(e) => updateTask(task.id, { estimateMinutes: e.target.value ? parseInt(e.target.value) : null })}
              className="w-14 bg-transparent text-text-primary outline-none"
            />
          </label>
        </div>

        <div className="mt-4 space-y-3 border-t border-border-subtle pt-4">
          <div className="flex items-center gap-2">
            <FolderKanban className="h-4 w-4 shrink-0 text-text-tertiary" />
            <select
              value={task.projectId ?? ''}
              onChange={(e) => moveTaskToProject(task.id, e.target.value || null)}
              className="h-8 flex-1 rounded-md border border-border-subtle bg-surface px-2 text-sm text-text-primary outline-none"
            >
              <option value="">No project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            {task.projectId && columns.length > 0 && (
              <select
                value={task.columnId ?? ''}
                onChange={(e) => updateTask(task.id, { columnId: e.target.value || null })}
                className="h-8 rounded-md border border-border-subtle bg-surface px-2 text-sm text-text-primary outline-none"
              >
                <option value="">No column</option>
                {columns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex items-start gap-2">
            <TagIcon className="mt-1.5 h-4 w-4 shrink-0 text-text-tertiary" />
            <div className="flex flex-1 flex-wrap items-center gap-1.5">
              {allLabels
                .filter((l) => task.labelIds.includes(l.id))
                .map((l) => (
                  <LabelBadge key={l.id} label={l} onRemove={() => updateTask(task.id, { labelIds: task.labelIds.filter((id) => id !== l.id) })} />
                ))}
              <LabelPicker
                selectedIds={task.labelIds}
                onToggle={(id) =>
                  updateTask(task.id, {
                    labelIds: task.labelIds.includes(id) ? task.labelIds.filter((x) => x !== id) : [...task.labelIds, id],
                  })
                }
              />
            </div>
          </div>
        </div>

        <div className="mt-4 border-t border-border-subtle pt-4">
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-text-tertiary">Description</p>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={commitDescription}
            placeholder="Add a description…"
            rows={3}
          />
        </div>

        <div className="mt-4 border-t border-border-subtle pt-4">
          <ChecklistEditor taskId={task.id} label="Subtasks" />
        </div>

        <div className="mt-4 border-t border-border-subtle pt-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-text-tertiary">
              <Clock className="h-3.5 w-3.5" /> Time tracked
            </span>
            <span className="font-mono text-sm tabular-nums text-text-primary">
              {formatDuration(trackedSeconds + (isRunningThisTask ? liveElapsed : 0))}
            </span>
          </div>
          {isRunningThisTask ? (
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" className="flex-1" onClick={() => stopAnyRunningTimer()}>
                <Square className="h-3.5 w-3.5" /> Stop
              </Button>
            </div>
          ) : (
            <Button size="sm" variant="secondary" className="w-full" onClick={() => startTimer(task.id)}>
              <Play className="h-3.5 w-3.5" /> Start timer
            </Button>
          )}
        </div>

        <div className="mt-4 border-t border-border-subtle pt-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-text-tertiary">
              <StickyNote className="h-3.5 w-3.5" /> Notes
            </span>
            <button
              className="text-xs font-medium text-accent hover:underline"
              onClick={() => createNote({ taskId: task.id, projectId: task.projectId, title: 'Note' })}
            >
              + Add note
            </button>
          </div>
          <div className="space-y-2">
            {notes.map((n) => (
              <textarea
                key={n.id}
                defaultValue={n.content}
                placeholder="Write a note…"
                onBlur={(e) => updateNote(n.id, { content: e.target.value })}
                rows={2}
                className="w-full resize-none rounded-md border border-border-subtle bg-surface px-2.5 py-1.5 text-sm text-text-primary outline-none focus-visible:border-accent"
              />
            ))}
          </div>
        </div>

        {activity.length > 0 && (
          <div className="mt-4 border-t border-border-subtle pt-4">
            <span className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-text-tertiary">
              <History className="h-3.5 w-3.5" /> Activity
            </span>
            <div className="space-y-2">
              {activity.slice(0, 8).map((a) => (
                <div key={a.logId} className="text-xs text-text-secondary">
                  <span className="text-text-tertiary">{new Date(a.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                  {' — '}
                  {a.message}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete this task?"
        description="It will be moved to Trash and permanently deleted after you empty the trash."
        confirmLabel="Delete"
        onConfirm={async () => {
          await trashTask(task.id)
          toast('Task moved to trash')
          onClose()
        }}
      />
    </>
  )
}
