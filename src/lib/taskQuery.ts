import type { Priority, Project, Task } from '@/data/types'
import { isPastDateKey, isTodayKey } from './dateHelpers'
import type { TaskFilters, TaskSortKey } from '@/components/tasks/taskFilterTypes'

const PRIORITY_RANK: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3, none: 4 }

export function applyTaskFilters(tasks: Task[], filters: TaskFilters): Task[] {
  return tasks.filter((t) => {
    switch (filters.view) {
      case 'today':
        if (t.status === 'done' || !isTodayKey(t.dueDate)) return false
        break
      case 'upcoming':
        if (t.status === 'done' || !t.dueDate || isPastDateKey(t.dueDate) || isTodayKey(t.dueDate)) return false
        break
      case 'overdue':
        if (t.status === 'done' || !isPastDateKey(t.dueDate)) return false
        break
      case 'completed':
        if (t.status !== 'done') return false
        break
      case 'no-deadline':
        if (t.dueDate || t.status === 'done') return false
        break
      default:
        break
    }

    if (filters.projectId && t.projectId !== filters.projectId) return false
    if (filters.priority !== 'any' && t.priority !== filters.priority) return false
    if (filters.labelIds.length > 0 && !filters.labelIds.every((id) => t.labelIds.includes(id))) return false
    if (filters.recurringOnly && !t.recurrence) return false

    return true
  })
}

export function sortTasks(tasks: Task[], sortKey: TaskSortKey, projects: Project[]): Task[] {
  const projectName = (id: string | null) => (id ? (projects.find((p) => p.id === id)?.name ?? '') : '')
  const withRank = (p: Priority) => PRIORITY_RANK[p ?? 'none']

  return [...tasks].sort((a, b) => {
    switch (sortKey) {
      case 'priority':
        return withRank(a.priority) - withRank(b.priority)
      case 'dueDate':
        return (a.dueDate ?? '9999-99-99').localeCompare(b.dueDate ?? '9999-99-99')
      case 'created':
        return b.createdAt.localeCompare(a.createdAt)
      case 'alphabetical':
        return a.title.localeCompare(b.title)
      case 'project':
        return projectName(a.projectId).localeCompare(projectName(b.projectId))
      default:
        return 0
    }
  })
}
