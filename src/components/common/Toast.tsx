import { CheckCircle2, Info, X, XCircle } from 'lucide-react'
import { useToastStore } from '@/stores/toastStore'
import { cn } from '@/lib/cn'

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts)
  const dismiss = useToastStore((s) => s.dismiss)

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2 sm:bottom-6 sm:right-6">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            'flex items-start gap-2.5 rounded-lg border border-border-subtle bg-surface-raised p-3 shadow-token-lg',
            'animate-[fadeIn_150ms_ease-out]',
          )}
        >
          {t.variant === 'success' && <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />}
          {t.variant === 'danger' && <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />}
          {(!t.variant || t.variant === 'default') && <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent" />}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-text-primary">{t.title}</p>
            {t.description && <p className="mt-0.5 text-xs text-text-secondary">{t.description}</p>}
            {t.action && (
              <button onClick={t.action.onClick} className="mt-1.5 text-xs font-semibold text-accent hover:underline">
                {t.action.label}
              </button>
            )}
          </div>
          <button onClick={() => dismiss(t.id)} className="text-text-tertiary hover:text-text-primary">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  )
}
