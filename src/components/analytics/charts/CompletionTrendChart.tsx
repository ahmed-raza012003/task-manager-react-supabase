import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { CompletionTrendPoint } from '@/data/analytics'

export function CompletionTrendChart({ data }: { data: CompletionTrendPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="completionFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }} axisLine={false} tickLine={false} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }} axisLine={false} tickLine={false} width={28} />
        <Tooltip
          contentStyle={{
            background: 'var(--color-surface-raised)',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: 8,
            fontSize: 12,
          }}
          labelStyle={{ color: 'var(--color-text-primary)' }}
        />
        <Area type="monotone" dataKey="completed" stroke="var(--color-accent)" strokeWidth={2} fill="url(#completionFill)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}
