import { useEffect } from 'react'
import { ensureSettings } from '@/data/settings'
import { pullAll, startRealtimeSync, stopRealtimeSync, syncConfigured } from '@/data/sync'

export function useSyncBootstrap() {
  useEffect(() => {
    if (!syncConfigured) return
    let cancelled = false

    async function boot() {
      const settings = await ensureSettings()
      if (cancelled || !settings.syncEnabled) return
      await pullAll()
      if (cancelled) return
      await startRealtimeSync()
    }

    boot()

    const interval = window.setInterval(() => {
      pullAll()
    }, 60_000)

    return () => {
      cancelled = true
      window.clearInterval(interval)
      stopRealtimeSync()
    }
  }, [])
}
