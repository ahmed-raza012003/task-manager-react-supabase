import { useLiveQuery } from 'dexie-react-hooks'
import { db } from './db'
import { createId, nowIso } from '@/lib/id'
import { orderAfterAll, orderBetween } from '@/lib/ordering'
import { syncPush, syncPushDelete } from './sync'
import type { KanbanColumn } from './types'

export const DEFAULT_COLUMNS = [
  { name: 'Backlog', treatAsDone: false },
  { name: 'To Do', treatAsDone: false },
  { name: 'In Progress', treatAsDone: false },
  { name: 'Review', treatAsDone: false },
  { name: 'Done', treatAsDone: true },
]

export async function seedDefaultColumns(projectId: string): Promise<KanbanColumn[]> {
  const ts = nowIso()
  const columns: KanbanColumn[] = DEFAULT_COLUMNS.map((c, i) => ({
    id: createId(),
    projectId,
    name: c.name,
    color: null,
    treatAsDone: c.treatAsDone,
    sortOrder: (i + 1) * 1024,
    createdAt: ts,
  }))
  await db.kanbanColumns.bulkAdd(columns)
  for (const c of columns) void syncPush('kanbanColumns', c.id)
  return columns
}

export function useKanbanColumns(projectId: string | null) {
  return useLiveQuery(
    async () => {
      if (!projectId) return []
      const cols = await db.kanbanColumns.where('projectId').equals(projectId).toArray()
      return cols.sort((a, b) => a.sortOrder - b.sortOrder)
    },
    [projectId],
    [] as KanbanColumn[],
  )
}

export async function createColumn(projectId: string, name: string): Promise<KanbanColumn> {
  const existing = await db.kanbanColumns.where('projectId').equals(projectId).toArray()
  const column: KanbanColumn = {
    id: createId(),
    projectId,
    name: name.trim(),
    color: null,
    treatAsDone: false,
    sortOrder: orderAfterAll(existing),
    createdAt: nowIso(),
  }
  await db.kanbanColumns.add(column)
  void syncPush('kanbanColumns', column.id)
  return column
}

export async function renameColumn(id: string, name: string): Promise<void> {
  await db.kanbanColumns.update(id, { name: name.trim() })
  void syncPush('kanbanColumns', id)
}

export async function setColumnTreatAsDone(id: string, treatAsDone: boolean): Promise<void> {
  await db.kanbanColumns.update(id, { treatAsDone })
  void syncPush('kanbanColumns', id)
}

export async function deleteColumn(id: string): Promise<void> {
  const affectedTaskIds: string[] = []
  await db.transaction('rw', db.kanbanColumns, db.tasks, async () => {
    const tasksInColumn = await db.tasks.where('columnId').equals(id).toArray()
    for (const t of tasksInColumn) {
      await db.tasks.update(t.id, { columnId: null })
      affectedTaskIds.push(t.id)
    }
    await db.kanbanColumns.delete(id)
  })
  void syncPushDelete('kanbanColumns', id)
  for (const taskId of affectedTaskIds) void syncPush('tasks', taskId)
}

export async function reorderColumn(id: string, beforeOrder: number | undefined, afterOrder: number | undefined): Promise<void> {
  await db.kanbanColumns.update(id, { sortOrder: orderBetween(beforeOrder, afterOrder) })
  void syncPush('kanbanColumns', id)
}
