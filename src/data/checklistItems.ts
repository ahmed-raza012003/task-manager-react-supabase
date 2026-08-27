import { useLiveQuery } from 'dexie-react-hooks'
import { db } from './db'
import { createId, nowIso } from '@/lib/id'
import { orderAfterAll } from '@/lib/ordering'
import { syncPush, syncPushDelete } from './sync'
import type { ChecklistItem } from './types'

export function useChecklistItems(taskId: string | null) {
  return useLiveQuery(
    async () => {
      if (!taskId) return []
      const items = await db.checklistItems.where('taskId').equals(taskId).toArray()
      return items.sort((a, b) => a.sortOrder - b.sortOrder)
    },
    [taskId],
    [] as ChecklistItem[],
  )
}

export async function addChecklistItem(taskId: string, title: string): Promise<ChecklistItem> {
  const existing = await db.checklistItems.where('taskId').equals(taskId).toArray()
  const item: ChecklistItem = {
    id: createId(),
    taskId,
    title: title.trim(),
    completed: false,
    sortOrder: orderAfterAll(existing),
    createdAt: nowIso(),
  }
  await db.checklistItems.add(item)
  void syncPush('checklistItems', item.id)
  return item
}

export async function toggleChecklistItem(id: string, completed: boolean): Promise<void> {
  await db.checklistItems.update(id, { completed })
  void syncPush('checklistItems', id)
}

export async function renameChecklistItem(id: string, title: string): Promise<void> {
  await db.checklistItems.update(id, { title: title.trim() })
  void syncPush('checklistItems', id)
}

export async function deleteChecklistItem(id: string): Promise<void> {
  await db.checklistItems.delete(id)
  void syncPushDelete('checklistItems', id)
}

export async function checklistProgress(taskId: string): Promise<{ done: number; total: number }> {
  const items = await db.checklistItems.where('taskId').equals(taskId).toArray()
  return { done: items.filter((i) => i.completed).length, total: items.length }
}

export async function cloneChecklistForTask(fromTaskId: string, toTaskId: string): Promise<void> {
  const items = await db.checklistItems.where('taskId').equals(fromTaskId).toArray()
  const clones: ChecklistItem[] = items.map((i) => ({
    ...i,
    id: createId(),
    taskId: toTaskId,
    completed: false,
    createdAt: nowIso(),
  }))
  if (clones.length) {
    await db.checklistItems.bulkAdd(clones)
    for (const c of clones) void syncPush('checklistItems', c.id)
  }
}

export async function deleteChecklistForTask(taskId: string): Promise<void> {
  const items = await db.checklistItems.where('taskId').equals(taskId).toArray()
  await db.checklistItems.bulkDelete(items.map((i) => i.id))
  for (const i of items) void syncPushDelete('checklistItems', i.id)
}
