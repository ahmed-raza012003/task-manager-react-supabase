import { Bell, BellOff, Check } from 'lucide-react'
import { PopoverRoot, PopoverTrigger, PopoverContent } from '@/components/common/Popover'
import { useUndismissedReminders, dismissReminder } from '@/data/reminders'
import { useTask } from '@/data/tasks'
import { useSettings, updateSettings } from '@/data/settings'
import { requestNotificationPermission } from '@/lib/notifications'
import { friendlyDateTimeLabel } from '@/lib/dateHelpers'
import { useUIStore } from '@/stores/uiStore'

function ReminderRow({ reminderId, taskId, message, remindAt }: { reminderId: string; taskId: string; message: string; remindAt: string }) {
  const task = useTask(taskId)
  const openTaskPanel = useUIStore((s) => s.openTaskPanel)
  return (
    <div className="flex items-start gap-2.5 rounded-md px-2 py-2 hover:bg-hover">
      <button className="min-w-0 flex-1 text-left" onClick={() => openTaskPanel(taskId)}>
        <p className="truncate text-sm font-medium text-text-primary">{task?.title ?? 'Task'}</p>
        <p className="mt-0.5 truncate text-xs text-text-secondary">{message || friendlyDateTimeLabel(remindAt.slice(0, 10), null)}</p>
      </button>
      <button
        onClick={() => dismissReminder(reminderId)}
        className="rounded p-1 text-text-tertiary hover:bg-inset hover:text-text-primary"
        aria-label="Dismiss"
      >
        <Check className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

export function NotificationCenter() {
  const reminders = useUndismissedReminders() ?? []
  const settings = useSettings()

  return (
    <PopoverRoot>
      <PopoverTrigger asChild>
        <button className="relative flex h-9 w-9 items-center justify-center rounded-md text-text-secondary hover:bg-hover hover:text-text-primary">
          <Bell className="h-[18px] w-[18px]" />
          {reminders.length > 0 && (
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger ring-2 ring-canvas" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-2">
        <div className="flex items-center justify-between px-1.5 pb-1.5">
          <span className="text-sm font-semibold text-text-primary">Notifications</span>
          {!settings?.notificationsEnabled && (
            <button
              className="flex items-center gap-1 text-xs font-medium text-accent hover:underline"
              onClick={async () => {
                await requestNotificationPermission()
                await updateSettings({ notificationsEnabled: true })
              }}
            >
              <BellOff className="h-3 w-3" /> Enable
            </button>
          )}
        </div>
        {reminders.length === 0 ? (
          <div className="px-1.5 py-6 text-center text-sm text-text-secondary">You're all caught up.</div>
        ) : (
          <div className="max-h-80 space-y-0.5 overflow-y-auto">
            {reminders.map((r) => (
              <ReminderRow key={r.id} reminderId={r.id} taskId={r.taskId} message={r.message} remindAt={r.remindAt} />
            ))}
          </div>
        )}
      </PopoverContent>
    </PopoverRoot>
  )
}
