import { useLiveQuery } from 'dexie-react-hooks'
import { db } from './db'
import { createId, nowIso } from '@/lib/id'
import { todayKey } from '@/lib/dateHelpers'
import { syncPush, syncPushDelete } from './sync'
import type { TimeEntry } from './types'

export function useRunningTimer() {
  return useLiveQuery(async () => {
    const rows = await db.timeEntries.where('isRunning').equals(1).toArray()
    return rows[0] ?? null
  }, [])
}

export function useTaskTimeEntries(taskId: string | null) {
  return useLiveQuery(
    async () => {
      if (!taskId) return []
      const rows = await db.timeEntries.where('taskId').equals(taskId).toArray()
      return rows.sort((a, b) => b.startedAt.localeCompare(a.startedAt))
    },
    [taskId],
    [] as TimeEntry[],
  )
}

export function useTaskTrackedSeconds(taskId: string | null): number {
  const entries = useTaskTimeEntries(taskId)
  return (entries ?? []).reduce((sum, e) => sum + (e.durationSeconds ?? 0), 0)
}

export async function startTimer(taskId: string): Promise<TimeEntry> {
  await stopAnyRunningTimer()
  const entry: TimeEntry = {
    id: createId(),
    taskId,
    startedAt: nowIso(),
    endedAt: null,
    durationSeconds: null,
    isRunning: 1,
    createdAt: nowIso(),
  }
  await db.timeEntries.add(entry)
  void syncPush('timeEntries', entry.id)
  return entry
}

export async function stopAnyRunningTimer(): Promise<void> {
  const running = await db.timeEntries.where('isRunning').equals(1).toArray()
  for (const entry of running) {
    const endedAt = nowIso()
    const durationSeconds = Math.max(0, Math.round((new Date(endedAt).getTime() - new Date(entry.startedAt).getTime()) / 1000))
    await db.timeEntries.update(entry.id, { endedAt, durationSeconds, isRunning: 0 })
    void syncPush('timeEntries', entry.id)
  }
}

export async function stopTimer(id: string): Promise<void> {
  const entry = await db.timeEntries.get(id)
  if (!entry) return
  const endedAt = nowIso()
  const durationSeconds = Math.max(0, Math.round((new Date(endedAt).getTime() - new Date(entry.startedAt).getTime()) / 1000))
  await db.timeEntries.update(id, { endedAt, durationSeconds, isRunning: 0 })
  void syncPush('timeEntries', id)
}

export async function deleteTimeEntry(id: string): Promise<void> {
  await db.timeEntries.delete(id)
  void syncPushDelete('timeEntries', id)
}

export function useTodayTrackedSeconds(): number {
  const result = useLiveQuery(async () => {
    const all = await db.timeEntries.toArray()
    const today = todayKey()
    return all
      .filter((e) => e.startedAt.slice(0, 10) === today && e.durationSeconds != null)
      .reduce((sum, e) => sum + (e.durationSeconds ?? 0), 0)
  }, [])
  return result ?? 0
}

export async function projectTrackedSeconds(projectId: string): Promise<number> {
  const tasks = await db.tasks.where('projectId').equals(projectId).toArray()
  const taskIds = new Set(tasks.map((t) => t.id))
  const all = await db.timeEntries.toArray()
  return all.filter((e) => taskIds.has(e.taskId) && e.durationSeconds != null).reduce((sum, e) => sum + (e.durationSeconds ?? 0), 0)
}
