import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { ProjectBreakdownPoint } from '@/data/analytics'

export function TasksByProjectChart({ data }: { data: ProjectBreakdownPoint[] }) {
  if (data.length === 0) {
    return <div className="flex h-[220px] items-center justify-center text-sm text-text-tertiary">No open tasks by project yet</div>
  }
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" horizontal={false} />
        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }} axisLine={false} tickLine={false} />
        <YAxis
          type="category"
          dataKey="project"
          width={110}
          tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{ background: 'var(--color-surface-raised)', border: '1px solid var(--color-border-subtle)', borderRadius: 8, fontSize: 12 }}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={14}>
          {data.map((entry) => (
            <Cell key={entry.project} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
