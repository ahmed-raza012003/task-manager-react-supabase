import { useLiveQuery } from 'dexie-react-hooks'
import { db } from './db'
import { createId, nowIso } from '@/lib/id'
import type { Reminder } from './types'

export function useUndismissedReminders() {
  return useLiveQuery(async () => {
    const all = await db.reminders.toArray()
    return all.filter((r) => !r.dismissed).sort((a, b) => a.remindAt.localeCompare(b.remindAt))
  }, [])
}

export function useTaskReminders(taskId: string | null) {
  return useLiveQuery(
    async () => {
      if (!taskId) return []
      return db.reminders.where('taskId').equals(taskId).toArray()
    },
    [taskId],
    [] as Reminder[],
  )
}

export async function createReminder(taskId: string, remindAt: string, message: string): Promise<Reminder> {
  const reminder: Reminder = {
    id: createId(),
    taskId,
    remindAt,
    message,
    dismissed: false,
    notifiedAt: null,
    createdAt: nowIso(),
  }
  await db.reminders.add(reminder)
  return reminder
}

export async function dismissReminder(id: string): Promise<void> {
  await db.reminders.update(id, { dismissed: true })
}

export async function markReminderNotified(id: string): Promise<void> {
  await db.reminders.update(id, { notifiedAt: nowIso() })
}

export async function deleteRemindersForTask(taskId: string): Promise<void> {
  await db.reminders.where('taskId').equals(taskId).delete()
}
