import { useLiveQuery } from 'dexie-react-hooks'
import { db } from './db'
import { createId, nowIso } from '@/lib/id'
import type { Settings } from './types'

export const SETTINGS_ID = 'app-settings' as const

export function defaultSettings(): Settings {
  const ts = nowIso()
  return {
    id: SETTINGS_ID,
    theme: 'system',
    compactMode: false,
    sidebarCollapsed: false,
    defaultPriority: 'medium',
    defaultDurationMinutes: 30,
    startOfWeek: 1,
    workingHours: { start: '09:00', end: '18:00' },
    notificationsEnabled: false,
    reminderLeadMinutes: 10,
    seeded: false,
    workspaceId: createId(),
    syncEnabled: false,
    createdAt: ts,
    updatedAt: ts,
  }
}

export async function ensureSettings(): Promise<Settings> {
  const existing = await db.settings.get(SETTINGS_ID)
  if (existing) {
    if (!existing.workspaceId || existing.syncEnabled === undefined) {
      const patched: Settings = { ...existing, workspaceId: existing.workspaceId || createId(), syncEnabled: existing.syncEnabled ?? false }
      await db.settings.put(patched)
      return patched
    }
    return existing
  }
  const fresh = defaultSettings()
  await db.settings.put(fresh)
  return fresh
}

export async function updateSettings(patch: Partial<Settings>): Promise<void> {
  const current = await ensureSettings()
  await db.settings.put({ ...current, ...patch, updatedAt: nowIso() })
}

export function useSettings() {
  return useLiveQuery(() => db.settings.get(SETTINGS_ID), [])
}
