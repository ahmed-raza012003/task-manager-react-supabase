import { useEffect } from 'react'
import { db } from '@/data/db'
import { markReminderNotified } from '@/data/reminders'
import { fireBrowserNotification } from '@/lib/notifications'
import { toast } from '@/stores/toastStore'
import { useSettings } from '@/data/settings'

export function useReminderScheduler() {
  const settings = useSettings()
  const enabled = settings?.notificationsEnabled ?? false

  useEffect(() => {
    if (!enabled) return

    async function checkDue() {
      const now = new Date()
      const all = await db.reminders.filter((r) => !r.dismissed && !r.notifiedAt).toArray()
      for (const reminder of all) {
        if (new Date(reminder.remindAt) <= now) {
          const task = await db.tasks.get(reminder.taskId)
          const title = task ? task.title : 'Task reminder'
          const fired = fireBrowserNotification(title, reminder.message || 'This task is due soon.')
          if (!fired) toast(title, reminder.message || 'This task is due soon.')
          await markReminderNotified(reminder.id)
        }
      }
    }

    checkDue()
    const interval = window.setInterval(checkDue, 30_000)
    return () => window.clearInterval(interval)
  }, [enabled])
}
