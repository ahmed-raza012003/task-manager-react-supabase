import { useState } from 'react'
import { Plus, Tag } from 'lucide-react'
import { PopoverRoot, PopoverTrigger, PopoverContent } from '@/components/common/Popover'
import { Checkbox } from '@/components/common/Checkbox'
import { Input } from '@/components/common/Input'
import { useLabels, createLabel } from '@/data/labels'
import { randomProjectColor } from '@/lib/colors'
import { cn } from '@/lib/cn'

export function LabelPicker({
  selectedIds,
  onToggle,
  trigger,
}: {
  selectedIds: string[]
  onToggle: (labelId: string) => void
  trigger?: React.ReactNode
}) {
  const labels = useLabels() ?? []
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)

  const filtered = labels.filter((l) => l.name.toLowerCase().includes(query.toLowerCase()))
  const canCreate = query.trim().length > 0 && !labels.some((l) => l.name.toLowerCase() === query.trim().toLowerCase())

  return (
    <PopoverRoot open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {trigger ?? (
          <button
            className={cn(
              'flex h-8 items-center gap-1.5 rounded-md border border-dashed border-border-strong px-2.5 text-xs font-medium text-text-secondary hover:bg-hover',
            )}
          >
            <Tag className="h-3.5 w-3.5" /> Labels
          </button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2">
        <Input placeholder="Search or create…" value={query} onChange={(e) => setQuery(e.target.value)} className="mb-2 h-8" autoFocus />
        <div className="max-h-56 space-y-0.5 overflow-y-auto">
          {filtered.map((label) => (
            <label key={label.id} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-hover">
              <Checkbox checked={selectedIds.includes(label.id)} onCheckedChange={() => onToggle(label.id)} />
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: label.color }} />
              <span className="text-sm text-text-primary">{label.name}</span>
            </label>
          ))}
          {canCreate && (
            <button
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-accent hover:bg-accent-subtle-bg"
              onClick={async () => {
                const label = await createLabel({ name: query, color: randomProjectColor() })
                onToggle(label.id)
                setQuery('')
              }}
            >
              <Plus className="h-3.5 w-3.5" /> Create "{query.trim()}"
            </button>
          )}
          {filtered.length === 0 && !canCreate && <p className="px-2 py-3 text-center text-xs text-text-tertiary">No labels found</p>}
        </div>
      </PopoverContent>
    </PopoverRoot>
  )
}
