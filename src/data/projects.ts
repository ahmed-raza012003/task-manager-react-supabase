import { useLiveQuery } from 'dexie-react-hooks'
import { db } from './db'
import { createId, nowIso } from '@/lib/id'
import { orderAfterAll } from '@/lib/ordering'
import { logActivity } from './activityLog'
import { seedDefaultColumns } from './kanbanColumns'
import { randomProjectColor } from '@/lib/colors'
import { syncPush, syncPushDelete } from './sync'
import type { Priority, Project, ProjectStatus } from './types'

export interface ProjectStats {
  total: number
  completed: number
  highPriority: number
  progress: number
}

export function useProjects(opts?: { includeArchived?: boolean }) {
  return useLiveQuery(
    async () => {
      const all = await db.projects.toArray()
      return all
        .filter((p) => !p.deletedAt && (opts?.includeArchived || !p.archivedAt))
        .sort((a, b) => a.sortOrder - b.sortOrder)
    },
    [opts?.includeArchived],
    [] as Project[],
  )
}

export function useActiveProjects() {
  return useLiveQuery(async () => {
    const all = await db.projects.toArray()
    return all.filter((p) => !p.deletedAt && !p.archivedAt && p.status === 'active')
  }, [])
}

export function useProject(id: string | null) {
  return useLiveQuery(() => (id ? db.projects.get(id) : undefined), [id])
}

export function useArchivedProjects() {
  return useLiveQuery(async () => {
    const all = await db.projects.toArray()
    return all.filter((p) => p.archivedAt && !p.deletedAt)
  }, [])
}

export function useTrashedProjects() {
  return useLiveQuery(async () => {
    const all = await db.projects.toArray()
    return all.filter((p) => p.deletedAt)
  }, [])
}

async function computeProjectStats(projectId: string): Promise<ProjectStats> {
  const tasks = await db.tasks.where('projectId').equals(projectId).toArray()
  const live = tasks.filter((t) => !t.deletedAt && !t.archivedAt)
  const completed = live.filter((t) => t.status === 'done').length
  const highPriority = live.filter((t) => (t.priority === 'urgent' || t.priority === 'high') && t.status !== 'done').length
  return {
    total: live.length,
    completed,
    highPriority,
    progress: live.length ? Math.round((completed / live.length) * 100) : 0,
  }
}

export function useProjectStats(projectId: string | null): ProjectStats {
  const stats = useLiveQuery(
    () => (projectId ? computeProjectStats(projectId) : Promise.resolve({ total: 0, completed: 0, highPriority: 0, progress: 0 })),
    [projectId],
  )
  return stats ?? { total: 0, completed: 0, highPriority: 0, progress: 0 }
}

export interface CreateProjectInput {
  name: string
  description?: string
  color?: string
  icon?: string
  status?: ProjectStatus
  priority?: Priority
  dueDate?: string | null
}

export async function createProject(input: CreateProjectInput): Promise<Project> {
  const ts = nowIso()
  const existing = await db.projects.toArray()
  const project: Project = {
    id: createId(),
    name: input.name.trim(),
    description: input.description ?? '',
    color: input.color ?? randomProjectColor(),
    icon: input.icon ?? 'Rocket',
    status: input.status ?? 'active',
    priority: input.priority ?? null,
    dueDate: input.dueDate ?? null,
    sortOrder: orderAfterAll(existing),
    archivedAt: null,
    deletedAt: null,
    createdAt: ts,
    updatedAt: ts,
  }
  await db.projects.add(project)
  await seedDefaultColumns(project.id)
  await logActivity('project', project.id, 'created', `Created project "${project.name}"`)
  void syncPush('projects', project.id)
  return project
}

export async function updateProject(id: string, patch: Partial<Project>): Promise<void> {
  await db.projects.update(id, { ...patch, updatedAt: nowIso() })
  await logActivity('project', id, 'updated', 'Updated project details')
  void syncPush('projects', id)
}

export async function archiveProject(id: string, archived: boolean): Promise<void> {
  await db.projects.update(id, { archivedAt: archived ? nowIso() : null, updatedAt: nowIso() })
  await logActivity('project', id, archived ? 'archived' : 'unarchived', archived ? 'Archived project' : 'Restored project from archive')
  void syncPush('projects', id)
}

export async function trashProject(id: string): Promise<void> {
  await db.projects.update(id, { deletedAt: nowIso() })
  await logActivity('project', id, 'trashed', 'Moved project to trash')
  void syncPush('projects', id)
}

export async function restoreProject(id: string): Promise<void> {
  await db.projects.update(id, { deletedAt: null })
  await logActivity('project', id, 'restored', 'Restored project from trash')
  void syncPush('projects', id)
}

export async function permanentlyDeleteProject(id: string): Promise<void> {
  const tasks = await db.tasks.where('projectId').equals(id).toArray()
  const columns = await db.kanbanColumns.where('projectId').equals(id).toArray()
  const notes = await db.notes.where('projectId').equals(id).toArray()

  await db.transaction('rw', [db.projects, db.kanbanColumns, db.tasks, db.checklistItems, db.timeEntries, db.notes, db.activityLog], async () => {
    for (const t of tasks) {
      await db.checklistItems.where('taskId').equals(t.id).delete()
      await db.timeEntries.where('taskId').equals(t.id).delete()
    }
    await db.tasks.where('projectId').equals(id).delete()
    await db.kanbanColumns.where('projectId').equals(id).delete()
    await db.notes.where('projectId').equals(id).delete()
    await db.activityLog.where('[entityType+entityId]').equals(['project', id]).delete()
    await db.projects.delete(id)
  })

  void syncPushDelete('projects', id)
  for (const t of tasks) void syncPushDelete('tasks', t.id)
  for (const c of columns) void syncPushDelete('kanbanColumns', c.id)
  for (const n of notes) void syncPushDelete('notes', n.id)
}
