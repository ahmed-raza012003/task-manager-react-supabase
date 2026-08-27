import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { Checkbox } from '@/components/common/Checkbox'
import { ProgressBar } from '@/components/common/ProgressBar'
import { useChecklistItems, addChecklistItem, toggleChecklistItem, renameChecklistItem, deleteChecklistItem } from '@/data/checklistItems'
import { cn } from '@/lib/cn'

export function ChecklistEditor({ taskId, label = 'Subtasks' }: { taskId: string; label?: string }) {
  const items = useChecklistItems(taskId) ?? []
  const [draft, setDraft] = useState('')
  const done = items.filter((i) => i.completed).length

  const submit = async () => {
    if (draft.trim()) {
      await addChecklistItem(taskId, draft.trim())
      setDraft('')
    }
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">{label}</span>
        {items.length > 0 && (
          <span className="text-xs text-text-tertiary">
            {done}/{items.length}
          </span>
        )}
      </div>

      {items.length > 0 && <ProgressBar value={(done / items.length) * 100} className="mb-3" />}

      <div className="space-y-1">
        {items.map((item) => (
          <div key={item.id} className="group flex items-center gap-2 rounded-md px-1 py-1 hover:bg-hover">
            <Checkbox checked={item.completed} onCheckedChange={(v) => toggleChecklistItem(item.id, v)} />
            <input
              defaultValue={item.title}
              onBlur={(e) => e.target.value.trim() && renameChecklistItem(item.id, e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
              className={cn(
                'min-w-0 flex-1 bg-transparent text-sm text-text-primary outline-none',
                item.completed && 'text-text-tertiary line-through',
              )}
            />
            <button
              onClick={() => deleteChecklistItem(item.id)}
              className="text-text-tertiary opacity-0 hover:text-danger group-hover:opacity-100"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-1 flex items-center gap-2 px-1">
        <Plus className="h-3.5 w-3.5 text-text-tertiary" />
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          onBlur={submit}
          placeholder={`Add ${label.toLowerCase().replace(/s$/, '')}…`}
          className="min-w-0 flex-1 bg-transparent py-1 text-sm text-text-primary placeholder:text-text-tertiary outline-none"
        />
      </div>
    </div>
  )
}
