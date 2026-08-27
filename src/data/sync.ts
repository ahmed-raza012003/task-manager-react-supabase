import type { RealtimeChannel } from '@supabase/supabase-js'
import { supabase, syncConfigured } from '@/lib/supabaseClient'
import { db } from './db'
import { nowIso } from '@/lib/id'
import type { ChecklistItem, KanbanColumn, Label, Note, Project, Task, TimeEntry } from './types'

export { syncConfigured }

/**
 * Every synced row is scoped to a workspace_id (a random device-generated code —
 * there is no login). Two tiers of conflict handling:
 *  - entities with a reliable local `updatedAt` (projects/tasks/labels/notes):
 *    last-write-wins by comparing timestamps on pull.
 *  - simple leaf entities without one (kanbanColumns/checklistItems/timeEntries):
 *    remote is treated as authoritative once pulled — acceptable at personal
 *    multi-device scale, where the same leaf row is rarely edited on two
 *    devices within seconds of each other.
 */

interface TableSync<TLocal extends { id: string }> {
  local: 'projects' | 'kanbanColumns' | 'tasks' | 'checklistItems' | 'labels' | 'notes' | 'timeEntries'
  remote: string
  toRemote: (row: TLocal, workspaceId: string) => Record<string, unknown>
  fromRemote: (row: Record<string, unknown>) => TLocal
  hasLocalUpdatedAt: boolean
}

const s = (v: unknown): string | null => (v == null ? null : String(v))

const projectSync: TableSync<Project> = {
  local: 'projects',
  remote: 'projects',
  hasLocalUpdatedAt: true,
  toRemote: (p, workspaceId) => ({
    id: p.id,
    workspace_id: workspaceId,
    name: p.name,
    description: p.description,
    color: p.color,
    icon: p.icon,
    status: p.status,
    priority: p.priority,
    due_date: p.dueDate,
    sort_order: p.sortOrder,
    archived_at: p.archivedAt,
    deleted_at: p.deletedAt,
    created_at: p.createdAt,
    updated_at: p.updatedAt,
  }),
  fromRemote: (r) => ({
    id: r.id as string,
    name: r.name as string,
    description: (r.description as string) ?? '',
    color: r.color as string,
    icon: r.icon as string,
    status: r.status as Project['status'],
    priority: r.priority as Project['priority'],
    dueDate: s(r.due_date),
    sortOrder: r.sort_order as number,
    archivedAt: s(r.archived_at),
    deletedAt: s(r.deleted_at),
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  }),
}

const kanbanColumnSync: TableSync<KanbanColumn> = {
  local: 'kanbanColumns',
  remote: 'kanban_columns',
  hasLocalUpdatedAt: false,
  toRemote: (c, workspaceId) => ({
    id: c.id,
    workspace_id: workspaceId,
    project_id: c.projectId,
    name: c.name,
    color: c.color,
    treat_as_done: c.treatAsDone,
    sort_order: c.sortOrder,
    created_at: c.createdAt,
  }),
  fromRemote: (r) => ({
    id: r.id as string,
    projectId: r.project_id as string,
    name: r.name as string,
    color: (r.color as string) ?? null,
    treatAsDone: Boolean(r.treat_as_done),
    sortOrder: r.sort_order as number,
    createdAt: r.created_at as string,
  }),
}

const taskSync: TableSync<Task> = {
  local: 'tasks',
  remote: 'tasks',
  hasLocalUpdatedAt: true,
  toRemote: (t, workspaceId) => ({
    id: t.id,
    workspace_id: workspaceId,
    project_id: t.projectId,
    column_id: t.columnId,
    title: t.title,
    description: t.description,
    status: t.status,
    priority: t.priority,
    label_ids: t.labelIds,
    due_date: t.dueDate,
    due_time: t.dueTime,
    start_date: t.startDate,
    time_of_day: t.timeOfDay,
    estimate_minutes: t.estimateMinutes,
    completed_at: t.completedAt,
    recurrence: t.recurrence,
    recurrence_root_id: t.recurrenceRootId,
    sort_order: t.sortOrder,
    archived_at: t.archivedAt,
    deleted_at: t.deletedAt,
    created_at: t.createdAt,
    updated_at: t.updatedAt,
  }),
  fromRemote: (r) => ({
    id: r.id as string,
    projectId: s(r.project_id),
    columnId: s(r.column_id),
    title: r.title as string,
    description: (r.description as string) ?? '',
    status: r.status as Task['status'],
    priority: r.priority as Task['priority'],
    labelIds: (r.label_ids as string[]) ?? [],
    dueDate: s(r.due_date),
    dueTime: s(r.due_time),
    startDate: s(r.start_date),
    timeOfDay: r.time_of_day as Task['timeOfDay'],
    estimateMinutes: (r.estimate_minutes as number) ?? null,
    completedAt: s(r.completed_at),
    recurrence: (r.recurrence as Task['recurrence']) ?? null,
    recurrenceRootId: s(r.recurrence_root_id),
    sortOrder: r.sort_order as number,
    archivedAt: s(r.archived_at),
    deletedAt: s(r.deleted_at),
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  }),
}

const checklistItemSync: TableSync<ChecklistItem> = {
  local: 'checklistItems',
  remote: 'checklist_items',
  hasLocalUpdatedAt: false,
  toRemote: (c, workspaceId) => ({
    id: c.id,
    workspace_id: workspaceId,
    task_id: c.taskId,
    title: c.title,
    completed: c.completed,
    sort_order: c.sortOrder,
    created_at: c.createdAt,
    updated_at: nowIso(),
  }),
  fromRemote: (r) => ({
    id: r.id as string,
    taskId: r.task_id as string,
    title: r.title as string,
    completed: Boolean(r.completed),
    sortOrder: r.sort_order as number,
    createdAt: r.created_at as string,
  }),
}

const labelSync: TableSync<Label> = {
  local: 'labels',
  remote: 'labels',
  hasLocalUpdatedAt: false,
  toRemote: (l, workspaceId) => ({
    id: l.id,
    workspace_id: workspaceId,
    name: l.name,
    color: l.color,
    archived_at: l.archivedAt,
    deleted_at: l.deletedAt,
    created_at: l.createdAt,
    updated_at: nowIso(),
  }),
  fromRemote: (r) => ({
    id: r.id as string,
    name: r.name as string,
    color: r.color as string,
    archivedAt: s(r.archived_at),
    deletedAt: s(r.deleted_at),
    createdAt: r.created_at as string,
  }),
}

const noteSync: TableSync<Note> = {
  local: 'notes',
  remote: 'notes',
  hasLocalUpdatedAt: true,
  toRemote: (n, workspaceId) => ({
    id: n.id,
    workspace_id: workspaceId,
    title: n.title,
    content: n.content,
    project_id: n.projectId,
    task_id: n.taskId,
    label_ids: n.labelIds,
    pinned: n.pinned,
    archived_at: n.archivedAt,
    deleted_at: n.deletedAt,
    created_at: n.createdAt,
    updated_at: n.updatedAt,
  }),
  fromRemote: (r) => ({
    id: r.id as string,
    title: r.title as string,
    content: (r.content as string) ?? '',
    projectId: s(r.project_id),
    taskId: s(r.task_id),
    labelIds: (r.label_ids as string[]) ?? [],
    pinned: Boolean(r.pinned),
    archivedAt: s(r.archived_at),
    deletedAt: s(r.deleted_at),
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  }),
}

const timeEntrySync: TableSync<TimeEntry> = {
  local: 'timeEntries',
  remote: 'time_entries',
  hasLocalUpdatedAt: false,
  toRemote: (e, workspaceId) => ({
    id: e.id,
    workspace_id: workspaceId,
    task_id: e.taskId,
    started_at: e.startedAt,
    ended_at: e.endedAt,
    duration_seconds: e.durationSeconds,
    is_running: e.isRunning,
    created_at: e.createdAt,
    updated_at: nowIso(),
  }),
  fromRemote: (r) => ({
    id: r.id as string,
    taskId: r.task_id as string,
    startedAt: r.started_at as string,
    endedAt: s(r.ended_at),
    durationSeconds: (r.duration_seconds as number) ?? null,
    isRunning: (r.is_running as 0 | 1) ?? 0,
    createdAt: r.created_at as string,
  }),
}

const ALL_SYNCS: TableSync<any>[] = [projectSync, kanbanColumnSync, taskSync, checklistItemSync, labelSync, noteSync, timeEntrySync]

function getWorkspaceId(): Promise<string | null> {
  return db.settings.get('app-settings').then((s) => s?.workspaceId ?? null)
}

async function isSyncActive(): Promise<boolean> {
  if (!syncConfigured) return false
  const settings = await db.settings.get('app-settings')
  return !!settings?.syncEnabled && !!settings.workspaceId
}

/** Push one local row up to Supabase. Fire-and-forget from call sites; failures are logged, never thrown. */
export async function syncPush(table: TableSync<never>['local'], id: string): Promise<void> {
  try {
    if (!(await isSyncActive())) return
    const workspaceId = await getWorkspaceId()
    if (!workspaceId || !supabase) return
    const spec = ALL_SYNCS.find((t) => t.local === table)
    if (!spec) return
    const row = await (db as any)[table].get(id)
    if (!row) return
    const remoteRow = spec.toRemote(row, workspaceId)
    const { error } = await supabase.from(spec.remote).upsert(remoteRow, { onConflict: 'workspace_id,id' })
    if (error) console.warn(`[sync] push ${table} failed:`, error.message)
  } catch (err) {
    console.warn(`[sync] push ${table} threw:`, err)
  }
}

/** Push a hard delete (used for permanent-delete / empty-trash operations). */
export async function syncPushDelete(table: TableSync<never>['local'], id: string): Promise<void> {
  try {
    if (!(await isSyncActive())) return
    const workspaceId = await getWorkspaceId()
    if (!workspaceId || !supabase) return
    const spec = ALL_SYNCS.find((t) => t.local === table)
    if (!spec) return
    const { error } = await supabase.from(spec.remote).delete().eq('workspace_id', workspaceId).eq('id', id)
    if (error) console.warn(`[sync] delete ${table} failed:`, error.message)
  } catch (err) {
    console.warn(`[sync] delete ${table} threw:`, err)
  }
}

async function mergeRemoteRow<TLocal extends { id: string }>(spec: TableSync<TLocal>, remoteRow: Record<string, unknown>): Promise<void> {
  const table = (db as any)[spec.local]
  const localRow = await table.get(remoteRow.id as string)
  const incoming = spec.fromRemote(remoteRow)

  if (!localRow) {
    await table.put(incoming)
    return
  }
  if (spec.hasLocalUpdatedAt) {
    const localUpdatedAt = (localRow as unknown as { updatedAt: string }).updatedAt
    const remoteUpdatedAt = (incoming as unknown as { updatedAt: string }).updatedAt
    if (remoteUpdatedAt > localUpdatedAt) await table.put(incoming)
  } else {
    await table.put(incoming)
  }
}

/** Full pull of every synced table for the current workspace. Called on connect and periodically. */
export async function pullAll(): Promise<void> {
  if (!(await isSyncActive()) || !supabase) return
  const workspaceId = await getWorkspaceId()
  if (!workspaceId) return

  for (const spec of ALL_SYNCS) {
    const { data, error } = await supabase.from(spec.remote).select('*').eq('workspace_id', workspaceId)
    if (error) {
      console.warn(`[sync] pull ${spec.remote} failed:`, error.message)
      continue
    }
    for (const row of data ?? []) {
      await mergeRemoteRow(spec, row as Record<string, unknown>)
    }
  }
}

let channels: RealtimeChannel[] = []

/** Push every local row up once — used the first time a workspace is joined/created, so existing local data isn't stranded. */
export async function pushAllLocal(): Promise<void> {
  if (!(await isSyncActive())) return
  for (const spec of ALL_SYNCS) {
    const rows: { id: string }[] = await (db as any)[spec.local].toArray()
    for (const row of rows) {
      await syncPush(spec.local, row.id)
    }
  }
}

export async function startRealtimeSync(): Promise<void> {
  if (!(await isSyncActive()) || !supabase) return
  const workspaceId = await getWorkspaceId()
  if (!workspaceId) return

  stopRealtimeSync()

  for (const spec of ALL_SYNCS) {
    const channel = supabase
      .channel(`sync-${spec.remote}-${workspaceId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: spec.remote, filter: `workspace_id=eq.${workspaceId}` },
        async (payload) => {
          if (payload.eventType === 'DELETE') {
            const oldId = (payload.old as Record<string, unknown> | null)?.id as string | undefined
            if (oldId) await (db as any)[spec.local].delete(oldId)
            return
          }
          await mergeRemoteRow(spec, payload.new as Record<string, unknown>)
        },
      )
      .subscribe()
    channels.push(channel)
  }
}

export function stopRealtimeSync(): void {
  for (const ch of channels) supabase?.removeChannel(ch)
  channels = []
}
