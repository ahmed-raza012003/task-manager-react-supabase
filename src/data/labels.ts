import { useLiveQuery } from 'dexie-react-hooks'
import { db } from './db'
import { createId, nowIso } from '@/lib/id'
import { logActivity } from './activityLog'
import { syncPush } from './sync'
import type { Label } from './types'

export function useLabels() {
  return useLiveQuery(
    async () => {
      const all = await db.labels.toArray()
      return all
        .filter((l) => !l.deletedAt && !l.archivedAt)
        .sort((a, b) => a.name.localeCompare(b.name))
    },
    [],
    [] as Label[],
  )
}

export function useLabel(id: string | null) {
  return useLiveQuery(() => (id ? db.labels.get(id) : undefined), [id])
}

export async function createLabel(input: { name: string; color: string }): Promise<Label> {
  const ts = nowIso()
  const label: Label = {
    id: createId(),
    name: input.name.trim(),
    color: input.color,
    archivedAt: null,
    deletedAt: null,
    createdAt: ts,
  }
  await db.labels.add(label)
  await logActivity('label', label.id, 'created', `Created label "${label.name}"`)
  void syncPush('labels', label.id)
  return label
}

export async function findOrCreateLabelByName(name: string, fallbackColor: string): Promise<Label> {
  const trimmed = name.trim()
  const existing = await db.labels.filter((l) => l.name.toLowerCase() === trimmed.toLowerCase() && !l.deletedAt).first()
  if (existing) return existing
  return createLabel({ name: trimmed, color: fallbackColor })
}

export async function updateLabel(id: string, patch: Partial<Pick<Label, 'name' | 'color'>>): Promise<void> {
  await db.labels.update(id, patch)
  await logActivity('label', id, 'updated', 'Updated label')
  void syncPush('labels', id)
}

export async function deleteLabel(id: string): Promise<void> {
  await db.labels.update(id, { deletedAt: nowIso() })
  const affectedTaskIds: string[] = []
  const affectedNoteIds: string[] = []
  await db.transaction('rw', db.tasks, db.notes, async () => {
    const taggedTasks = await db.tasks.where('labelIds').equals(id).toArray()
    for (const t of taggedTasks) {
      await db.tasks.update(t.id, { labelIds: t.labelIds.filter((l) => l !== id) })
      affectedTaskIds.push(t.id)
    }
    const taggedNotes = await db.notes.where('labelIds').equals(id).toArray()
    for (const n of taggedNotes) {
      await db.notes.update(n.id, { labelIds: n.labelIds.filter((l) => l !== id) })
      affectedNoteIds.push(n.id)
    }
  })
  await logActivity('label', id, 'deleted', 'Deleted label')
  void syncPush('labels', id)
  for (const taskId of affectedTaskIds) void syncPush('tasks', taskId)
  for (const noteId of affectedNoteIds) void syncPush('notes', noteId)
}
