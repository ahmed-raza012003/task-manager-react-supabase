import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pencil, Plus, Tag, Trash2 } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'
import { Button } from '@/components/common/Button'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { LabelFormDialog } from '@/components/labels/LabelForm'
import { useLabels, deleteLabel } from '@/data/labels'
import { useAllTasks } from '@/data/tasks'
import { toast } from '@/stores/toastStore'
import type { Label } from '@/data/types'

export default function LabelsPage() {
  const labels = useLabels() ?? []
  const tasks = useAllTasks() ?? []
  const navigate = useNavigate()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Label | null>(null)
  const [deleting, setDeleting] = useState<Label | null>(null)

  return (
    <div className="mx-auto max-w-3xl space-y-5 px-4 py-6 md:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-text-primary">Labels</h1>
          <p className="mt-1 text-sm text-text-secondary">{labels.length} label{labels.length === 1 ? '' : 's'}</p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setEditing(null)
            setFormOpen(true)
          }}
        >
          <Plus className="h-4 w-4" /> New label
        </Button>
      </div>

      {labels.length === 0 ? (
        <EmptyState icon={<Tag className="h-6 w-6" />} title="No labels yet" description="Create labels to organize and filter your tasks." />
      ) : (
        <div className="divide-y divide-border-subtle rounded-xl border border-border-subtle bg-surface">
          {labels.map((l) => {
            const count = tasks.filter((t) => t.labelIds.includes(l.id)).length
            return (
              <div key={l.id} className="flex items-center gap-3 px-4 py-3">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: l.color }} />
                <button
                  onClick={() => navigate(`/tasks?label=${l.id}`)}
                  className="flex-1 truncate text-left text-sm font-medium text-text-primary hover:underline"
                >
                  {l.name}
                </button>
                <span className="text-xs text-text-tertiary">{count} task{count === 1 ? '' : 's'}</span>
                <button
                  onClick={() => {
                    setEditing(l)
                    setFormOpen(true)
                  }}
                  className="rounded-md p-1.5 text-text-tertiary hover:bg-hover hover:text-text-primary"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => setDeleting(l)} className="rounded-md p-1.5 text-text-tertiary hover:bg-danger-subtle-bg hover:text-danger">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )
          })}
        </div>
      )}

      <LabelFormDialog open={formOpen} onOpenChange={setFormOpen} editing={editing} />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`Delete "${deleting?.name}"?`}
        description="This label will be removed from all tasks and notes."
        confirmLabel="Delete"
        onConfirm={async () => {
          if (deleting) {
            await deleteLabel(deleting.id)
            toast('Label deleted')
          }
        }}
      />
    </div>
  )
}
