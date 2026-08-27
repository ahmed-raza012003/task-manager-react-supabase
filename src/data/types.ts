export type Priority = 'urgent' | 'high' | 'medium' | 'low' | null

export type TaskStatus = 'todo' | 'in_progress' | 'done'

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | null

export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed'

export type RecurrenceFreq = 'daily' | 'weekdays' | 'weekly' | 'monthly' | 'yearly'

export interface RecurrenceRule {
  freq: RecurrenceFreq
  interval: number
  byWeekday?: number[]
  endDate?: string | null
  count?: number | null
}

export interface ChecklistItem {
  id: string
  taskId: string
  title: string
  completed: boolean
  sortOrder: number
  createdAt: string
}

export interface Task {
  id: string
  projectId: string | null
  columnId: string | null
  title: string
  description: string
  status: TaskStatus
  priority: Priority
  labelIds: string[]
  dueDate: string | null
  dueTime: string | null
  startDate: string | null
  timeOfDay: TimeOfDay
  estimateMinutes: number | null
  completedAt: string | null
  recurrence: RecurrenceRule | null
  recurrenceRootId: string | null
  sortOrder: number
  archivedAt: string | null
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface Project {
  id: string
  name: string
  description: string
  color: string
  icon: string
  status: ProjectStatus
  priority: Priority
  dueDate: string | null
  sortOrder: number
  archivedAt: string | null
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface KanbanColumn {
  id: string
  projectId: string
  name: string
  color: string | null
  treatAsDone: boolean
  sortOrder: number
  createdAt: string
}

export interface Label {
  id: string
  name: string
  color: string
  archivedAt: string | null
  deletedAt: string | null
  createdAt: string
}

export interface Note {
  id: string
  title: string
  content: string
  projectId: string | null
  taskId: string | null
  labelIds: string[]
  pinned: boolean
  archivedAt: string | null
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface TimeEntry {
  id: string
  taskId: string
  startedAt: string
  endedAt: string | null
  durationSeconds: number | null
  isRunning: 0 | 1
  createdAt: string
}

export type ActivityEntityType = 'task' | 'project' | 'note' | 'label' | 'timeEntry'

export interface ActivityLogEntry {
  logId?: number
  entityType: ActivityEntityType
  entityId: string
  action: string
  message: string
  meta?: Record<string, unknown>
  createdAt: string
}

export interface Reminder {
  id: string
  taskId: string
  remindAt: string
  message: string
  dismissed: boolean
  notifiedAt: string | null
  createdAt: string
}

export type ThemeMode = 'light' | 'dark' | 'system'

export interface Settings {
  id: 'app-settings'
  theme: ThemeMode
  compactMode: boolean
  sidebarCollapsed: boolean
  defaultPriority: Priority
  defaultDurationMinutes: number
  startOfWeek: 0 | 1
  workingHours: { start: string; end: string }
  notificationsEnabled: boolean
  reminderLeadMinutes: number
  seeded: boolean
  workspaceId: string
  syncEnabled: boolean
  createdAt: string
  updatedAt: string
}
