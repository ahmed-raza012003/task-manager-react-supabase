import { CheckCircle2, Clock, TrendingUp } from 'lucide-react'
import { StatCard } from '@/components/analytics/StatCard'
import { CompletionTrendChart } from '@/components/analytics/charts/CompletionTrendChart'
import { TasksByPriorityChart } from '@/components/analytics/charts/TasksByPriorityChart'
import { TasksByProjectChart } from '@/components/analytics/charts/TasksByProjectChart'
import { ProductiveDaysChart } from '@/components/analytics/charts/ProductiveDaysChart'
import { useAnalyticsData, useDashboardStats } from '@/data/analytics'
import { formatDuration } from '@/lib/dateHelpers'

export default function AnalyticsPage() {
  const data = useAnalyticsData(14)
  const stats = useDashboardStats()

  if (!data) return null

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 md:px-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-text-primary">Analytics</h1>
        <p className="mt-1 text-sm text-text-secondary">Your productivity, at a glance.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Completed this week" value={data.completedThisWeek} icon={<CheckCircle2 className="h-3.5 w-3.5" />} tone="success" />
        <StatCard label="Completed this month" value={data.completedThisMonth} icon={<CheckCircle2 className="h-3.5 w-3.5" />} tone="success" />
        <StatCard label="Completion rate" value={`${stats.completionRate}%`} icon={<TrendingUp className="h-3.5 w-3.5" />} tone="accent" />
        <StatCard label="Total time tracked" value={formatDuration(data.totalTimeTrackedSeconds)} icon={<Clock className="h-3.5 w-3.5" />} tone="warning" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border-subtle bg-surface p-4">
          <h2 className="mb-3 font-display text-sm font-semibold text-text-primary">Completions — last 14 days</h2>
          <CompletionTrendChart data={data.completionTrend} />
        </div>
        <div className="rounded-xl border border-border-subtle bg-surface p-4">
          <h2 className="mb-3 font-display text-sm font-semibold text-text-primary">Most productive days</h2>
          <ProductiveDaysChart data={data.productiveDays} />
        </div>
        <div className="rounded-xl border border-border-subtle bg-surface p-4">
          <h2 className="mb-3 font-display text-sm font-semibold text-text-primary">Open tasks by priority</h2>
          <TasksByPriorityChart data={data.priorityBreakdown} />
        </div>
        <div className="rounded-xl border border-border-subtle bg-surface p-4">
          <h2 className="mb-3 font-display text-sm font-semibold text-text-primary">Open tasks by project</h2>
          <TasksByProjectChart data={data.projectBreakdown} />
        </div>
      </div>
    </div>
  )
}
