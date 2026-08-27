import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { ProductiveDayPoint } from '@/data/analytics'

export function ProductiveDaysChart({ data }: { data: ProductiveDayPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" vertical={false} />
        <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }} axisLine={false} tickLine={false} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }} axisLine={false} tickLine={false} width={28} />
        <Tooltip
          contentStyle={{ background: 'var(--color-surface-raised)', border: '1px solid var(--color-border-subtle)', borderRadius: 8, fontSize: 12 }}
        />
        <Bar dataKey="count" fill="var(--color-accent)" radius={[4, 4, 0, 0]} barSize={22} />
      </BarChart>
    </ResponsiveContainer>
  )
}
