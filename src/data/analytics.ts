import { useLiveQuery } from 'dexie-react-hooks'
import { db } from './db'
import { isDueSoon, isPastDateKey, isTodayKey, todayKey } from '@/lib/dateHelpers'
import { format, parseISO, subDays } from 'date-fns'

export interface DashboardStats {
  todayCount: number
  completedTodayCount: number
  overdueCount: number
  dueSoonCount: number
  activeProjectsCount: number
  completionRate: number
  currentStreak: number
  timeTrackedTodaySeconds: number
}

export function useDashboardStats(): DashboardStats {
  const result = useLiveQuery(async () => {
    const [tasks, projects, timeEntries] = await Promise.all([
      db.tasks.toArray(),
      db.projects.toArray(),
      db.timeEntries.toArray(),
    ])
    const live = tasks.filter((t) => !t.deletedAt && !t.archivedAt)
    const today = todayKey()

    const todayCount = live.filter((t) => t.status !== 'done' && t.dueDate && isTodayKey(t.dueDate)).length
    const completedTodayCount = live.filter((t) => t.completedAt && t.completedAt.slice(0, 10) === today).length
    const overdueCount = live.filter((t) => t.status !== 'done' && isPastDateKey(t.dueDate)).length
    const dueSoonCount = live.filter((t) => t.status !== 'done' && isDueSoon(t.dueDate, 3) && !isTodayKey(t.dueDate)).length
    const activeProjectsCount = projects.filter((p) => !p.deletedAt && !p.archivedAt && p.status === 'active').length

    const doneCount = live.filter((t) => t.status === 'done').length
    const completionRate = live.length ? Math.round((doneCount / live.length) * 100) : 0

    const completedDates = new Set(live.filter((t) => t.completedAt).map((t) => t.completedAt!.slice(0, 10)))
    let streak = 0
    let cursor = new Date()
    while (completedDates.has(format(cursor, 'yyyy-MM-dd'))) {
      streak += 1
      cursor = subDays(cursor, 1)
    }

    const timeTrackedTodaySeconds = timeEntries
      .filter((e) => e.startedAt.slice(0, 10) === today && e.durationSeconds != null)
      .reduce((sum, e) => sum + (e.durationSeconds ?? 0), 0)

    return {
      todayCount,
      completedTodayCount,
      overdueCount,
      dueSoonCount,
      activeProjectsCount,
      completionRate,
      currentStreak: streak,
      timeTrackedTodaySeconds,
    }
  }, [])

  return (
    result ?? {
      todayCount: 0,
      completedTodayCount: 0,
      overdueCount: 0,
      dueSoonCount: 0,
      activeProjectsCount: 0,
      completionRate: 0,
      currentStreak: 0,
      timeTrackedTodaySeconds: 0,
    }
  )
}

export interface CompletionTrendPoint {
  date: string
  label: string
  completed: number
}

export interface PriorityBreakdownPoint {
  priority: string
  count: number
}

export interface ProjectBreakdownPoint {
  project: string
  color: string
  count: number
}

export interface ProductiveDayPoint {
  day: string
  count: number
}

export interface AnalyticsData {
  completionTrend: CompletionTrendPoint[]
  priorityBreakdown: PriorityBreakdownPoint[]
  projectBreakdown: ProjectBreakdownPoint[]
  productiveDays: ProductiveDayPoint[]
  completedThisWeek: number
  completedThisMonth: number
  totalTimeTrackedSeconds: number
}

const PRIORITY_LABELS: Record<string, string> = {
  urgent: 'Urgent',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  none: 'No priority',
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function useAnalyticsData(rangeDays = 14): AnalyticsData | undefined {
  return useLiveQuery(async () => {
    const [tasks, projects, timeEntries] = await Promise.all([
      db.tasks.toArray(),
      db.projects.toArray(),
      db.timeEntries.toArray(),
    ])
    const live = tasks.filter((t) => !t.deletedAt && !t.archivedAt)

    const trendMap = new Map<string, number>()
    for (let i = rangeDays - 1; i >= 0; i--) {
      const key = format(subDays(new Date(), i), 'yyyy-MM-dd')
      trendMap.set(key, 0)
    }
    for (const t of live) {
      if (t.completedAt) {
        const key = t.completedAt.slice(0, 10)
        if (trendMap.has(key)) trendMap.set(key, (trendMap.get(key) ?? 0) + 1)
      }
    }
    const completionTrend: CompletionTrendPoint[] = Array.from(trendMap.entries()).map(([date, completed]) => ({
      date,
      label: format(parseISO(date), 'MMM d'),
      completed,
    }))

    const priorityCounts: Record<string, number> = { urgent: 0, high: 0, medium: 0, low: 0, none: 0 }
    for (const t of live) {
      if (t.status === 'done') continue
      priorityCounts[t.priority ?? 'none'] += 1
    }
    const priorityBreakdown: PriorityBreakdownPoint[] = Object.entries(priorityCounts)
      .filter(([, count]) => count > 0)
      .map(([priority, count]) => ({ priority: PRIORITY_LABELS[priority], count }))

    const projectCounts = new Map<string, number>()
    for (const t of live) {
      if (!t.projectId || t.status === 'done') continue
      projectCounts.set(t.projectId, (projectCounts.get(t.projectId) ?? 0) + 1)
    }
    const projectBreakdown: ProjectBreakdownPoint[] = Array.from(projectCounts.entries())
      .map(([projectId, count]) => {
        const p = projects.find((pr) => pr.id === projectId)
        return { project: p?.name ?? 'Unknown', color: p?.color ?? '#8A8780', count }
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)

    const dayCounts = new Array(7).fill(0)
    for (const t of live) {
      if (t.completedAt) {
        const day = new Date(t.completedAt).getDay()
        dayCounts[day] += 1
      }
    }
    const productiveDays: ProductiveDayPoint[] = DAY_LABELS.map((label, i) => ({ day: label, count: dayCounts[i] }))

    const weekAgo = format(subDays(new Date(), 7), 'yyyy-MM-dd')
    const monthAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd')
    const completedThisWeek = live.filter((t) => t.completedAt && t.completedAt.slice(0, 10) >= weekAgo).length
    const completedThisMonth = live.filter((t) => t.completedAt && t.completedAt.slice(0, 10) >= monthAgo).length

    const totalTimeTrackedSeconds = timeEntries.reduce((sum, e) => sum + (e.durationSeconds ?? 0), 0)

    return {
      completionTrend,
      priorityBreakdown,
      projectBreakdown,
      productiveDays,
      completedThisWeek,
      completedThisMonth,
      totalTimeTrackedSeconds,
    }
  }, [rangeDays])
}
