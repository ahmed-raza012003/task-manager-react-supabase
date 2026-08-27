import { AlertTriangle } from 'lucide-react'
import { Dialog, DialogTitle, DialogDescription } from './Dialog'
import { Button } from './Button'
import { useState } from 'react'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel?: string
  danger?: boolean
  requireTypedConfirmation?: string
  onConfirm: () => void | Promise<void>
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  danger = true,
  requireTypedConfirmation,
  onConfirm,
}: ConfirmDialogProps) {
  const [typed, setTyped] = useState('')
  const [busy, setBusy] = useState(false)
  const locked = !!requireTypedConfirmation && typed !== requireTypedConfirmation

  const handleConfirm = async () => {
    setBusy(true)
    try {
      await onConfirm()
      onOpenChange(false)
      setTyped('')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="max-w-sm">
      <div className="p-5">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-danger-subtle-bg text-danger">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <DialogTitle className="font-display text-base font-semibold text-text-primary">{title}</DialogTitle>
        <DialogDescription className="mt-1.5 text-sm text-text-secondary">{description}</DialogDescription>
        {requireTypedConfirmation && (
          <input
            autoFocus
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder={`Type "${requireTypedConfirmation}" to confirm`}
            className="mt-3 h-9 w-full rounded-md border border-border-subtle bg-surface px-3 text-sm focus-visible:outline-none focus-visible:border-danger"
          />
        )}
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={handleConfirm} disabled={locked || busy}>
            {busy ? 'Working…' : confirmLabel}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
