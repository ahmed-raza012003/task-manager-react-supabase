import { useState } from 'react'
import { Dialog, DialogTitle } from '@/components/common/Dialog'
import { Input } from '@/components/common/Input'
import { Button } from '@/components/common/Button'
import { LABEL_COLORS, randomProjectColor } from '@/lib/colors'
import { createLabel, updateLabel } from '@/data/labels'
import { cn } from '@/lib/cn'
import type { Label } from '@/data/types'

export function LabelFormDialog({ open, onOpenChange, editing }: { open: boolean; onOpenChange: (o: boolean) => void; editing: Label | null }) {
  const [name, setName] = useState(editing?.name ?? '')
  const [color, setColor] = useState(editing?.color ?? randomProjectColor())

  const submit = async () => {
    if (!name.trim()) return
    if (editing) await updateLabel(editing.id, { name: name.trim(), color })
    else await createLabel({ name: name.trim(), color })
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o)
        if (o) {
          setName(editing?.name ?? '')
          setColor(editing?.color ?? randomProjectColor())
        }
      }}
      className="max-w-xs"
    >
      <div className="p-5">
        <DialogTitle className="mb-3 font-display text-base font-semibold text-text-primary">{editing ? 'Edit label' : 'New label'}</DialogTitle>
        <Input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Label name" onKeyDown={(e) => e.key === 'Enter' && submit()} />
        <div className="mt-3 flex flex-wrap gap-1.5">
          {LABEL_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={cn('h-6 w-6 rounded-full ring-offset-2 ring-offset-surface-raised', color === c && 'ring-2 ring-accent')}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={submit} disabled={!name.trim()}>
            {editing ? 'Save' : 'Create'}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
