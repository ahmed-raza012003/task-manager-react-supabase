import type { Priority } from '@/data/types'

export type TaskView = 'all' | 'today' | 'upcoming' | 'overdue' | 'completed' | 'no-deadline'

export interface TaskFilters {
  view: TaskView
  projectId: string | null
  priority: Priority | 'any'
  labelIds: string[]
  recurringOnly: boolean
}

export type TaskSortKey = 'priority' | 'dueDate' | 'created' | 'alphabetical' | 'project'

export const DEFAULT_FILTERS: TaskFilters = {
  view: 'all',
  projectId: null,
  priority: 'any',
  labelIds: [],
  recurringOnly: false,
}

export const VIEW_LABELS: Record<TaskView, string> = {
  all: 'All',
  today: 'Today',
  upcoming: 'Upcoming',
  overdue: 'Overdue',
  completed: 'Completed',
  'no-deadline': 'No deadline',
}
