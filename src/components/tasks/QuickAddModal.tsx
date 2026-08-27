import { useEffect, useMemo, useState } from 'react'
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react'
import { Dialog } from '@/components/common/Dialog'
import { Input } from '@/components/common/Input'
import { Button } from '@/components/common/Button'
import { PriorityDot } from '@/components/common/PriorityDot'
import { useQuickAddStore } from '@/stores/quickAddStore'
import { useProjects } from '@/data/projects'
import { useKanbanColumns } from '@/data/kanbanColumns'
import { createTask } from '@/data/tasks'
import { findOrCreateLabelByName } from '@/data/labels'
import { parseQuickAdd } from '@/lib/nlpQuickAdd'
import { friendlyDateLabel } from '@/lib/dateHelpers'
import { priorityLabel, randomProjectColor } from '@/lib/colors'
import { cn } from '@/lib/cn'
import { toast } from '@/stores/toastStore'
import type { Priority } from '@/data/types'

const PRIORITIES: Priority[] = [null, 'low', 'medium', 'high', 'urgent']

export function QuickAddModal() {
  const isOpen = useQuickAddStore((s) => s.isOpen)
  const close = useQuickAddStore((s) => s.close)
  const prefill = useQuickAddStore((s) => s.prefill)
  const projects = useProjects() ?? []

  const [text, setText] = useState('')
  const [expanded, setExpanded] = useState(false)
  const [projectId, setProjectId] = useState<string>('')
  const [columnId, setColumnId] = useState<string>('')
  const [priority, setPriority] = useState<Priority>(null)
  const [dueDate, setDueDate] = useState<string>('')
  const columns = useKanbanColumns(projectId || null) ?? []

  useEffect(() => {
    if (isOpen) {
      setText(prefill.text ?? '')
      setProjectId(prefill.projectId ?? '')
      setColumnId(prefill.columnId ?? '')
      setDueDate(prefill.dueDate ?? '')
      setPriority(null)
      setExpanded(false)
    }
  }, [isOpen, prefill])

  const parsed = useMemo(() => parseQuickAdd(text), [text])

  const matchedProject = useMemo(() => {
    if (!parsed.projectName) return null
    return projects.find((p) => p.name.toLowerCase().includes(parsed.projectName!.toLowerCase())) ?? null
  }, [parsed.projectName, projects])

  const submit = async () => {
    const title = parsed.title || text.trim()
    if (!title) return

    const labelIds: string[] = []
    for (const name of parsed.labelNames) {
      const label = await findOrCreateLabelByName(name, randomProjectColor())
      labelIds.push(label.id)
    }

    const finalProjectId = projectId || matchedProject?.id || null

    await createTask({
      title,
      projectId: finalProjectId,
      columnId: columnId || null,
      priority: priority ?? parsed.priority,
      dueDate: dueDate || parsed.dueDate,
      dueTime: parsed.dueTime,
      timeOfDay: parsed.timeOfDay,
      labelIds,
    })

    toast('Task created', title)
    close()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && close()} className="max-w-lg" showClose={false}>
      <div className="p-4">
        <div className="flex items-center gap-2 rounded-lg border border-border-strong bg-surface px-3 focus-within:border-accent focus-within:shadow-[var(--ring-accent)]">
          <Sparkles className="h-4 w-4 shrink-0 text-accent" />
          <input
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submit()
              if (e.key === 'Escape') close()
            }}
            placeholder='Try "Finish homepage tomorrow #design high"'
            className="h-11 flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-tertiary"
          />
        </div>

        {(parsed.dueDate || parsed.priority || parsed.labelNames.length > 0 || matchedProject) && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {parsed.dueDate && <ParsedPill>{friendlyDateLabel(parsed.dueDate)}</ParsedPill>}
            {parsed.priority && <ParsedPill>{priorityLabel(parsed.priority)} priority</ParsedPill>}
            {matchedProject && <ParsedPill>→ {matchedProject.name}</ParsedPill>}
            {parsed.labelNames.map((l) => (
              <ParsedPill key={l}>#{l}</ParsedPill>
            ))}
          </div>
        )}

        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 flex items-center gap-1 text-xs font-medium text-text-secondary hover:text-text-primary"
        >
          {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          {expanded ? 'Hide details' : 'More details'}
        </button>

        {expanded && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <select
              value={projectId}
              onChange={(e) => {
                setProjectId(e.target.value)
                setColumnId('')
              }}
              className="h-9 rounded-md border border-border-subtle bg-surface px-2 text-sm text-text-primary outline-none"
            >
              <option value="">No project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <select
              value={columnId}
              onChange={(e) => setColumnId(e.target.value)}
              disabled={!projectId}
              className="h-9 rounded-md border border-border-subtle bg-surface px-2 text-sm text-text-primary outline-none disabled:opacity-40"
            >
              <option value="">Default column</option>
              {columns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="h-9" />
            <div className="flex items-center gap-1">
              {PRIORITIES.map((p) => (
                <button
                  key={p ?? 'none'}
                  onClick={() => setPriority(p)}
                  className={cn(
                    'flex h-9 flex-1 items-center justify-center rounded-md border',
                    priority === p ? 'border-accent bg-accent-subtle-bg' : 'border-border-subtle hover:bg-hover',
                  )}
                >
                  <PriorityDot priority={p} />
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-text-tertiary">Press Enter to create</p>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={close}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={submit} disabled={!text.trim()}>
              Create task
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  )
}

function ParsedPill({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-accent-subtle-bg px-2 py-0.5 text-[11px] font-medium text-accent-subtle-text">{children}</span>
}
