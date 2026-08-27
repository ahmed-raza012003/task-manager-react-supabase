import { useEffect, useState } from 'react'
import * as Icons from 'lucide-react'
import { Dialog, DialogTitle } from '@/components/common/Dialog'
import { Input, Textarea } from '@/components/common/Input'
import { Button } from '@/components/common/Button'
import { Select } from '@/components/common/Select'
import { useProjectDialogStore } from '@/stores/projectDialogStore'
import { useProject, createProject, updateProject } from '@/data/projects'
import { PROJECT_COLORS, PROJECT_ICONS, randomProjectColor } from '@/lib/colors'
import { cn } from '@/lib/cn'
import { toast } from '@/stores/toastStore'
import type { Priority, ProjectStatus } from '@/data/types'
import type { LucideIcon } from 'lucide-react'

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: 'planning', label: 'Planning' },
  { value: 'active', label: 'Active' },
  { value: 'on_hold', label: 'On hold' },
  { value: 'completed', label: 'Completed' },
]

const PRIORITY_OPTIONS: { value: string; label: string }[] = [
  { value: 'none', label: 'No priority' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
]

export function ProjectFormDialog() {
  const isOpen = useProjectDialogStore((s) => s.isOpen)
  const close = useProjectDialogStore((s) => s.close)
  const editingId = useProjectDialogStore((s) => s.editingId)
  const existing = useProject(editingId)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState(randomProjectColor())
  const [icon, setIcon] = useState('Rocket')
  const [status, setStatus] = useState<ProjectStatus>('active')
  const [priority, setPriority] = useState<string>('none')
  const [dueDate, setDueDate] = useState('')

  useEffect(() => {
    if (!isOpen) return
    if (existing) {
      setName(existing.name)
      setDescription(existing.description)
      setColor(existing.color)
      setIcon(existing.icon)
      setStatus(existing.status)
      setPriority(existing.priority ?? 'none')
      setDueDate(existing.dueDate ?? '')
    } else {
      setName('')
      setDescription('')
      setColor(randomProjectColor())
      setIcon('Rocket')
      setStatus('active')
      setPriority('none')
      setDueDate('')
    }
  }, [isOpen, editingId, existing])

  const submit = async () => {
    if (!name.trim()) return
    const payload = {
      name,
      description,
      color,
      icon,
      status,
      priority: (priority === 'none' ? null : priority) as Priority,
      dueDate: dueDate || null,
    }
    if (existing) {
      await updateProject(existing.id, payload)
      toast('Project updated')
    } else {
      await createProject(payload)
      toast('Project created', name)
    }
    close()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && close()} className="max-w-md">
      <div className="p-5">
        <DialogTitle className="mb-4 font-display text-base font-semibold text-text-primary">
          {existing ? 'Edit project' : 'New project'}
        </DialogTitle>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-text-secondary">Name</label>
            <Input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Project name" />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-text-secondary">Description</label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="What's this project about?" />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-text-secondary">Icon & color</label>
            <div className="flex flex-wrap items-center gap-1.5">
              {PROJECT_ICONS.map((iconName) => {
                const IconComp = Icons[iconName] as LucideIcon
                return (
                  <button
                    key={iconName}
                    onClick={() => setIcon(iconName)}
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-md border',
                      icon === iconName ? 'border-accent bg-accent-subtle-bg text-accent' : 'border-border-subtle text-text-secondary hover:bg-hover',
                    )}
                  >
                    <IconComp className="h-4 w-4" />
                  </button>
                )
              })}
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {PROJECT_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn('h-6 w-6 rounded-full ring-offset-2 ring-offset-surface-raised', color === c && 'ring-2 ring-accent')}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">Status</label>
              <Select value={status} onValueChange={(v) => setStatus(v as ProjectStatus)} options={STATUS_OPTIONS} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">Priority</label>
              <Select value={priority} onValueChange={setPriority} options={PRIORITY_OPTIONS} />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-text-secondary">Deadline</label>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={close}>
            Cancel
          </Button>
          <Button variant="primary" onClick={submit} disabled={!name.trim()}>
            {existing ? 'Save changes' : 'Create project'}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
