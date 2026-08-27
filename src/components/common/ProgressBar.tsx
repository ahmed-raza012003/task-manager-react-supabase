import { cn } from '@/lib/cn'

export function ProgressBar({ value, className, tone = 'accent' }: { value: number; className?: string; tone?: 'accent' | 'success' }) {
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <div className={cn('h-1.5 w-full overflow-hidden rounded-full bg-inset', className)}>
      <div
        className={cn('h-full rounded-full transition-all duration-300', tone === 'accent' ? 'bg-accent' : 'bg-success')}
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}
