import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import type { PriorityBreakdownPoint } from '@/data/analytics'

const COLORS: Record<string, string> = {
  Urgent: 'var(--color-priority-urgent)',
  High: 'var(--color-priority-high)',
  Medium: 'var(--color-priority-medium)',
  Low: 'var(--color-priority-low)',
  'No priority': 'var(--color-text-tertiary)',
}

export function TasksByPriorityChart({ data }: { data: PriorityBreakdownPoint[] }) {
  if (data.length === 0) {
    return <div className="flex h-[220px] items-center justify-center text-sm text-text-tertiary">No open tasks yet</div>
  }
  return (
    <div className="flex items-center gap-4">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={data} dataKey="count" nameKey="priority" innerRadius={50} outerRadius={80} paddingAngle={2}>
            {data.map((entry) => (
              <Cell key={entry.priority} fill={COLORS[entry.priority] ?? 'var(--color-text-tertiary)'} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: 'var(--color-surface-raised)', border: '1px solid var(--color-border-subtle)', borderRadius: 8, fontSize: 12 }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="shrink-0 space-y-1.5">
        {data.map((d) => (
          <div key={d.priority} className="flex items-center gap-1.5 text-xs text-text-secondary">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[d.priority] }} />
            {d.priority} <span className="font-semibold text-text-primary">{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
