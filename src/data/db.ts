import Dexie, { type EntityTable } from 'dexie'
import type {
  ActivityLogEntry,
  ChecklistItem,
  KanbanColumn,
  Label,
  Note,
  Project,
  Reminder,
  Settings,
  Task,
  TimeEntry,
} from './types'

export class TaskManagerDB extends Dexie {
  projects!: EntityTable<Project, 'id'>
  kanbanColumns!: EntityTable<KanbanColumn, 'id'>
  tasks!: EntityTable<Task, 'id'>
  checklistItems!: EntityTable<ChecklistItem, 'id'>
  labels!: EntityTable<Label, 'id'>
  notes!: EntityTable<Note, 'id'>
  timeEntries!: EntityTable<TimeEntry, 'id'>
  activityLog!: EntityTable<ActivityLogEntry, 'logId'>
  reminders!: EntityTable<Reminder, 'id'>
  settings!: EntityTable<Settings, 'id'>

  constructor() {
    super('task-manager-db')
    this.version(1).stores({
      projects: 'id, status, archivedAt, deletedAt, sortOrder, dueDate',
      kanbanColumns: 'id, projectId, [projectId+sortOrder]',
      tasks:
        'id, projectId, columnId, status, priority, dueDate, completedAt, ' +
        'archivedAt, deletedAt, recurrenceRootId, sortOrder, *labelIds, ' +
        '[projectId+status], [projectId+columnId], [status+dueDate]',
      checklistItems: 'id, taskId, sortOrder',
      labels: 'id, archivedAt, deletedAt',
      notes: 'id, projectId, taskId, pinned, archivedAt, deletedAt, *labelIds',
      timeEntries: 'id, taskId, isRunning, [taskId+isRunning]',
      activityLog: '++logId, entityId, [entityType+entityId], createdAt',
      reminders: 'id, taskId, remindAt, dismissed',
      settings: 'id',
    })
  }
}

export const db = new TaskManagerDB()
