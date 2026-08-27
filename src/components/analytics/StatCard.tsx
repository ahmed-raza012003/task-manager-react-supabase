import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/cn'
import type { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: string | number
  icon: ReactNode
  tone?: 'accent' | 'success' | 'warning' | 'danger'
  sublabel?: string
  to?: string
}

const toneClasses: Record<string, string> = {
  accent: 'bg-accent-subtle-bg text-accent-subtle-text',
  success: 'bg-success-subtle-bg text-success',
  warning: 'bg-warning-subtle-bg text-warning',
  danger: 'bg-danger-subtle-bg text-danger',
}

export function StatCard({ label, value, icon, tone = 'accent', sublabel, to }: StatCardProps) {
  const navigate = useNavigate()

  return (
    <div
      onClick={to ? () => navigate(to) : undefined}
      className={cn(
        'rounded-xl border border-border-subtle bg-surface p-4 transition-all',
        to && 'cursor-pointer hover:-translate-y-0.5 hover:border-border-strong hover:shadow-token-md',
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">{label}</span>
        <span className={cn('flex h-7 w-7 items-center justify-center rounded-full', toneClasses[tone])}>{icon}</span>
      </div>
      <p className="mt-2 font-display text-2xl font-semibold tabular-nums text-text-primary">{value}</p>
      {sublabel && <p className="mt-0.5 text-xs text-text-tertiary">{sublabel}</p>}
    </div>
  )
}
