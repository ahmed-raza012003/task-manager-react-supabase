import { z } from 'zod'
import { db } from './db'
import { defaultSettings } from './settings'
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

const EXPORT_VERSION = 1

const looseRecord = z.record(z.string(), z.unknown())

const exportSchema = z.object({
  version: z.number(),
  exportedAt: z.string(),
  data: z.object({
    projects: z.array(looseRecord),
    kanbanColumns: z.array(looseRecord),
    tasks: z.array(looseRecord),
    checklistItems: z.array(looseRecord),
    labels: z.array(looseRecord),
    notes: z.array(looseRecord),
    timeEntries: z.array(looseRecord),
    activityLog: z.array(looseRecord),
    reminders: z.array(looseRecord),
    settings: z.array(looseRecord),
  }),
})

export type ExportBundle = z.infer<typeof exportSchema>

export async function exportAllData(): Promise<ExportBundle> {
  const [projects, kanbanColumns, tasks, checklistItems, labels, notes, timeEntries, activityLog, reminders, settings] =
    await Promise.all([
      db.projects.toArray(),
      db.kanbanColumns.toArray(),
      db.tasks.toArray(),
      db.checklistItems.toArray(),
      db.labels.toArray(),
      db.notes.toArray(),
      db.timeEntries.toArray(),
      db.activityLog.toArray(),
      db.reminders.toArray(),
      db.settings.toArray(),
    ])

  return {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    data: {
      projects,
      kanbanColumns,
      tasks,
      checklistItems,
      labels,
      notes,
      timeEntries,
      activityLog,
      reminders,
      settings,
    },
  } as unknown as ExportBundle
}

export function downloadExport(bundle: ExportBundle): void {
  const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  const stamp = new Date().toISOString().slice(0, 10)
  a.download = `flowline-backup-${stamp}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export interface ImportResult {
  success: boolean
  error?: string
  counts?: Record<string, number>
}

export async function importData(raw: unknown): Promise<ImportResult> {
  const parsed = exportSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: 'This file is not a valid Flowline backup.' }
  }
  const { data } = parsed.data

  try {
    await db.transaction(
      'rw',
      [db.projects, db.kanbanColumns, db.tasks, db.checklistItems, db.labels, db.notes, db.timeEntries, db.activityLog, db.reminders, db.settings],
      async () => {
        await Promise.all([
          db.projects.clear(),
          db.kanbanColumns.clear(),
          db.tasks.clear(),
          db.checklistItems.clear(),
          db.labels.clear(),
          db.notes.clear(),
          db.timeEntries.clear(),
          db.activityLog.clear(),
          db.reminders.clear(),
          db.settings.clear(),
        ])
        await db.projects.bulkPut(data.projects as unknown as Project[])
        await db.kanbanColumns.bulkPut(data.kanbanColumns as unknown as KanbanColumn[])
        await db.tasks.bulkPut(data.tasks as unknown as Task[])
        await db.checklistItems.bulkPut(data.checklistItems as unknown as ChecklistItem[])
        await db.labels.bulkPut(data.labels as unknown as Label[])
        await db.notes.bulkPut(data.notes as unknown as Note[])
        await db.timeEntries.bulkPut(data.timeEntries as unknown as TimeEntry[])
        await db.activityLog.bulkPut(data.activityLog as unknown as ActivityLogEntry[])
        await db.reminders.bulkPut(data.reminders as unknown as Reminder[])
        const settingsRows = data.settings.length ? data.settings : [defaultSettings()]
        await db.settings.bulkPut(settingsRows as unknown as Settings[])
      },
    )
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Import failed.' }
  }

  return {
    success: true,
    counts: {
      projects: data.projects.length,
      tasks: data.tasks.length,
      notes: data.notes.length,
      labels: data.labels.length,
    },
  }
}

export async function resetAllData(): Promise<void> {
  await db.transaction(
    'rw',
    [db.projects, db.kanbanColumns, db.tasks, db.checklistItems, db.labels, db.notes, db.timeEntries, db.activityLog, db.reminders, db.settings],
    async () => {
      await Promise.all([
        db.projects.clear(),
        db.kanbanColumns.clear(),
        db.tasks.clear(),
        db.checklistItems.clear(),
        db.labels.clear(),
        db.notes.clear(),
        db.timeEntries.clear(),
        db.activityLog.clear(),
        db.reminders.clear(),
      ])
      await db.settings.put(defaultSettings())
    },
  )
}

export async function emptyTrash(): Promise<void> {
  await db.transaction('rw', [db.projects, db.tasks, db.checklistItems, db.timeEntries, db.reminders, db.notes, db.activityLog], async () => {
    const trashedTasks = await db.tasks.filter((t) => !!t.deletedAt).toArray()
    for (const t of trashedTasks) {
      await db.checklistItems.where('taskId').equals(t.id).delete()
      await db.timeEntries.where('taskId').equals(t.id).delete()
      await db.reminders.where('taskId').equals(t.id).delete()
    }
    await db.tasks.filter((t) => !!t.deletedAt).delete()
    await db.projects.filter((p) => !!p.deletedAt).delete()
    await db.notes.filter((n) => !!n.deletedAt).delete()
  })
}
