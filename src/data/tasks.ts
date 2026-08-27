import { useLiveQuery } from 'dexie-react-hooks'
import { db } from './db'
import { createId, nowIso } from '@/lib/id'
import { orderAfterAll, orderBetween } from '@/lib/ordering'
import { computeNextDueDate, shouldStopSeries } from '@/lib/recurrence'
import { todayKey } from '@/lib/dateHelpers'
import { logActivity } from './activityLog'
import { cloneChecklistForTask, deleteChecklistForTask } from './checklistItems'
import { syncPush, syncPushDelete } from './sync'
import type { Priority, RecurrenceRule, Task, TaskStatus, TimeOfDay } from './types'

export function useAllTasks() {
  return useLiveQuery(
    async () => {
      const all = await db.tasks.toArray()
      return all.filter((t) => !t.deletedAt && !t.archivedAt)
    },
    [],
    [] as Task[],
  )
}

export function useTask(id: string | null) {
  return useLiveQuery(() => (id ? db.tasks.get(id) : undefined), [id])
}

export function useProjectTasks(projectId: string | null) {
  return useLiveQuery(
    async () => {
      if (!projectId) return []
      const all = await db.tasks.where('projectId').equals(projectId).toArray()
      return all.filter((t) => !t.deletedAt && !t.archivedAt)
    },
    [projectId],
    [] as Task[],
  )
}

export function useTrashedTasks() {
  return useLiveQuery(async () => {
    const all = await db.tasks.toArray()
    return all.filter((t) => t.deletedAt)
  }, [])
}

export function useArchivedTasks() {
  return useLiveQuery(async () => {
    const all = await db.tasks.toArray()
    return all.filter((t) => t.archivedAt && !t.deletedAt)
  }, [])
}

export interface CreateTaskInput {
  title: string
  description?: string
  projectId?: string | null
  columnId?: string | null
  status?: TaskStatus
  priority?: Priority
  labelIds?: string[]
  dueDate?: string | null
  dueTime?: string | null
  startDate?: string | null
  timeOfDay?: TimeOfDay
  estimateMinutes?: number | null
  recurrence?: RecurrenceRule | null
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const ts = nowIso()
  const siblings = await siblingsForOrdering(input.projectId ?? null, input.columnId ?? null)
  const task: Task = {
    id: createId(),
    projectId: input.projectId ?? null,
    columnId: input.columnId ?? null,
    title: input.title.trim(),
    description: input.description ?? '',
    status: input.status ?? 'todo',
    priority: input.priority ?? null,
    labelIds: input.labelIds ?? [],
    dueDate: input.dueDate ?? null,
    dueTime: input.dueTime ?? null,
    startDate: input.startDate ?? null,
    timeOfDay: input.timeOfDay ?? null,
    estimateMinutes: input.estimateMinutes ?? null,
    completedAt: null,
    recurrence: input.recurrence ?? null,
    recurrenceRootId: null,
    sortOrder: orderAfterAll(siblings),
    archivedAt: null,
    deletedAt: null,
    createdAt: ts,
    updatedAt: ts,
  }
  await db.tasks.add(task)
  await logActivity('task', task.id, 'created', `Created task "${task.title}"`)
  void syncPush('tasks', task.id)
  return task
}

async function siblingsForOrdering(projectId: string | null, columnId: string | null): Promise<Task[]> {
  if (columnId) {
    const all = await db.tasks.where('columnId').equals(columnId).toArray()
    return all.filter((t) => !t.deletedAt && !t.archivedAt)
  }
  if (projectId) {
    const all = await db.tasks.where('projectId').equals(projectId).toArray()
    return all.filter((t) => !t.deletedAt && !t.archivedAt)
  }
  const all = await db.tasks.toArray()
  return all.filter((t) => !t.deletedAt && !t.archivedAt && !t.projectId)
}

export async function updateTask(id: string, patch: Partial<Task>): Promise<void> {
  await db.tasks.update(id, { ...patch, updatedAt: nowIso() })
  void syncPush('tasks', id)
}

export async function completeTask(id: string): Promise<{ nextTask: Task | null }> {
  const task = await db.tasks.get(id)
  if (!task) return { nextTask: null }
  const ts = nowIso()
  await db.tasks.update(id, { status: 'done', completedAt: ts, updatedAt: ts })
  await logActivity('task', id, 'completed', `Completed "${task.title}"`)
  void syncPush('tasks', id)

  if (!task.recurrence) return { nextTask: null }

  const baseDate = task.dueDate ?? todayKey()
  const nextDue = computeNextDueDate(task.recurrence, baseDate)
  const rootId = task.recurrenceRootId ?? task.id
  const occurrenceIndex = await countOccurrences(rootId)
  if (shouldStopSeries(task.recurrence, nextDue, occurrenceIndex)) return { nextTask: null }

  const nextTask: Task = {
    ...task,
    id: createId(),
    dueDate: nextDue,
    completedAt: null,
    status: 'todo',
    recurrenceRootId: rootId,
    sortOrder: orderAfterAll(await siblingsForOrdering(task.projectId, task.columnId)),
    createdAt: ts,
    updatedAt: ts,
  }
  await db.tasks.add(nextTask)
  await cloneChecklistForTask(task.id, nextTask.id)
  await logActivity('task', nextTask.id, 'created', `Scheduled next occurrence of "${task.title}"`)
  void syncPush('tasks', nextTask.id)
  return { nextTask }
}

async function countOccurrences(rootId: string): Promise<number> {
  const rows = await db.tasks.where('recurrenceRootId').equals(rootId).toArray()
  return rows.length + 1
}

export async function uncompleteTask(id: string): Promise<void> {
  await db.tasks.update(id, { status: 'todo', completedAt: null, updatedAt: nowIso() })
  void syncPush('tasks', id)
}

export async function duplicateTask(id: string): Promise<Task | null> {
  const task = await db.tasks.get(id)
  if (!task) return null
  const ts = nowIso()
  const clone: Task = {
    ...task,
    id: createId(),
    title: `${task.title} (copy)`,
    status: 'todo',
    completedAt: null,
    recurrenceRootId: null,
    sortOrder: orderAfterAll(await siblingsForOrdering(task.projectId, task.columnId)),
    createdAt: ts,
    updatedAt: ts,
  }
  await db.tasks.add(clone)
  await cloneChecklistForTask(id, clone.id)
  await logActivity('task', clone.id, 'created', `Duplicated "${task.title}"`)
  void syncPush('tasks', clone.id)
  return clone
}

export async function moveTaskToColumn(id: string, columnId: string | null, beforeOrder?: number, afterOrder?: number): Promise<void> {
  const column = columnId ? await db.kanbanColumns.get(columnId) : null
  const patch: Partial<Task> = {
    columnId,
    sortOrder: orderBetween(beforeOrder, afterOrder),
    updatedAt: nowIso(),
  }
  if (column?.treatAsDone) {
    patch.status = 'done'
    patch.completedAt = nowIso()
  } else if (column && !column.treatAsDone) {
    const current = await db.tasks.get(id)
    if (current?.status === 'done') patch.status = 'todo'
    if (current?.completedAt) patch.completedAt = null
  }
  await db.tasks.update(id, patch)
  void syncPush('tasks', id)
}

export async function reorderTask(id: string, beforeOrder: number | undefined, afterOrder: number | undefined): Promise<void> {
  await db.tasks.update(id, { sortOrder: orderBetween(beforeOrder, afterOrder), updatedAt: nowIso() })
  void syncPush('tasks', id)
}

export async function moveTaskToProject(id: string, projectId: string | null): Promise<void> {
  await db.tasks.update(id, { projectId, columnId: null, updatedAt: nowIso() })
  void syncPush('tasks', id)
}

export async function archiveTask(id: string, archived: boolean): Promise<void> {
  await db.tasks.update(id, { archivedAt: archived ? nowIso() : null, updatedAt: nowIso() })
  await logActivity('task', id, archived ? 'archived' : 'unarchived', archived ? 'Archived task' : 'Restored task from archive')
  void syncPush('tasks', id)
}

export async function trashTask(id: string): Promise<void> {
  await db.tasks.update(id, { deletedAt: nowIso() })
  await logActivity('task', id, 'trashed', 'Moved task to trash')
  void syncPush('tasks', id)
}

export async function restoreTask(id: string): Promise<void> {
  await db.tasks.update(id, { deletedAt: null })
  await logActivity('task', id, 'restored', 'Restored task from trash')
  void syncPush('tasks', id)
}

export async function permanentlyDeleteTask(id: string): Promise<void> {
  await deleteChecklistForTask(id)
  await db.timeEntries.where('taskId').equals(id).delete()
  await db.reminders.where('taskId').equals(id).delete()
  await db.activityLog.where('[entityType+entityId]').equals(['task', id]).delete()
  await db.tasks.delete(id)
  void syncPushDelete('tasks', id)
}

export async function addLabelToTask(taskId: string, labelId: string): Promise<void> {
  const task = await db.tasks.get(taskId)
  if (!task || task.labelIds.includes(labelId)) return
  await db.tasks.update(taskId, { labelIds: [...task.labelIds, labelId], updatedAt: nowIso() })
  void syncPush('tasks', taskId)
}

export async function removeLabelFromTask(taskId: string, labelId: string): Promise<void> {
  const task = await db.tasks.get(taskId)
  if (!task) return
  await db.tasks.update(taskId, { labelIds: task.labelIds.filter((l) => l !== labelId), updatedAt: nowIso() })
  void syncPush('tasks', taskId)
}
