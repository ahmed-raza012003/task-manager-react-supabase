import { Dialog, DialogTitle } from '@/components/common/Dialog'
import { useShortcutsHelpStore } from '@/stores/projectDialogStore'
import { SHORTCUTS } from '@/lib/keyboardShortcuts'

export function ShortcutsHelpDialog() {
  const isOpen = useShortcutsHelpStore((s) => s.isOpen)
  const close = useShortcutsHelpStore((s) => s.close)

  const groups = Array.from(new Set(SHORTCUTS.map((s) => s.group)))

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && close()} className="max-w-md">
      <div className="p-5">
        <DialogTitle className="mb-4 font-display text-base font-semibold text-text-primary">Keyboard shortcuts</DialogTitle>
        <div className="space-y-4">
          {groups.map((group) => (
            <div key={group}>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-text-tertiary">{group}</p>
              <div className="space-y-1.5">
                {SHORTCUTS.filter((s) => s.group === group).map((s) => (
                  <div key={s.keys} className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">{s.description}</span>
                    <div className="flex gap-1">
                      {s.keys.split(' ').map((k) => (
                        <kbd key={k} className="rounded border border-border-subtle bg-inset px-1.5 py-0.5 text-[11px] font-medium text-text-primary">
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Dialog>
  )
}
