import { useLiveQuery } from 'dexie-react-hooks'
import { db } from './db'
import { nowIso } from '@/lib/id'
import type { ActivityEntityType, ActivityLogEntry } from './types'

export async function logActivity(
  entityType: ActivityEntityType,
  entityId: string,
  action: string,
  message: string,
  meta?: Record<string, unknown>,
): Promise<void> {
  const entry: ActivityLogEntry = {
    entityType,
    entityId,
    action,
    message,
    meta,
    createdAt: nowIso(),
  }
  await db.activityLog.add(entry)
}

export function useEntityActivity(entityType: ActivityEntityType, entityId: string | null) {
  return useLiveQuery(async () => {
    if (!entityId) return []
    const rows = await db.activityLog.where('[entityType+entityId]').equals([entityType, entityId]).toArray()
    return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }, [entityType, entityId])
}

export function useRecentActivity(limit = 20) {
  return useLiveQuery(async () => {
    return db.activityLog.orderBy('createdAt').reverse().limit(limit).toArray()
  }, [limit])
}
