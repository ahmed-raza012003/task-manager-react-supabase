import { useLiveQuery } from 'dexie-react-hooks'
import { db } from './db'
import { createId, nowIso } from '@/lib/id'
import { logActivity } from './activityLog'
import { syncPush, syncPushDelete } from './sync'
import type { Note } from './types'

export function useNotes(filter?: { projectId?: string | null; taskId?: string | null }) {
  return useLiveQuery(
    async () => {
      const all = await db.notes.toArray()
      let rows = all.filter((n) => !n.deletedAt && !n.archivedAt)
      if (filter?.projectId !== undefined) rows = rows.filter((n) => n.projectId === filter.projectId)
      if (filter?.taskId !== undefined) rows = rows.filter((n) => n.taskId === filter.taskId)
      return rows.sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
        return b.updatedAt.localeCompare(a.updatedAt)
      })
    },
    [filter?.projectId, filter?.taskId],
    [] as Note[],
  )
}

export function useNote(id: string | null) {
  return useLiveQuery(() => (id ? db.notes.get(id) : undefined), [id])
}

export function useArchivedNotes() {
  return useLiveQuery(async () => {
    const all = await db.notes.toArray()
    return all.filter((n) => n.archivedAt && !n.deletedAt)
  }, [])
}

export interface CreateNoteInput {
  title?: string
  content?: string
  projectId?: string | null
  taskId?: string | null
  labelIds?: string[]
}

export async function createNote(input: CreateNoteInput): Promise<Note> {
  const ts = nowIso()
  const note: Note = {
    id: createId(),
    title: input.title ?? 'Untitled note',
    content: input.content ?? '',
    projectId: input.projectId ?? null,
    taskId: input.taskId ?? null,
    labelIds: input.labelIds ?? [],
    pinned: false,
    archivedAt: null,
    deletedAt: null,
    createdAt: ts,
    updatedAt: ts,
  }
  await db.notes.add(note)
  await logActivity('note', note.id, 'created', `Created note "${note.title}"`)
  void syncPush('notes', note.id)
  return note
}

export async function updateNote(id: string, patch: Partial<Note>): Promise<void> {
  await db.notes.update(id, { ...patch, updatedAt: nowIso() })
  void syncPush('notes', id)
}

export async function togglePinNote(id: string, pinned: boolean): Promise<void> {
  await db.notes.update(id, { pinned, updatedAt: nowIso() })
  void syncPush('notes', id)
}

export async function archiveNote(id: string, archived: boolean): Promise<void> {
  await db.notes.update(id, { archivedAt: archived ? nowIso() : null, updatedAt: nowIso() })
  void syncPush('notes', id)
}

export async function trashNote(id: string): Promise<void> {
  await db.notes.update(id, { deletedAt: nowIso() })
  void syncPush('notes', id)
}

export async function restoreNote(id: string): Promise<void> {
  await db.notes.update(id, { deletedAt: null })
  void syncPush('notes', id)
}

export async function permanentlyDeleteNote(id: string): Promise<void> {
  await db.notes.delete(id)
  void syncPushDelete('notes', id)
}

export function useTrashedNotes() {
  return useLiveQuery(async () => {
    const all = await db.notes.toArray()
    return all.filter((n) => n.deletedAt)
  }, [])
}
