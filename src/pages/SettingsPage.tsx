import { useRef, useState } from 'react'
import { Download, Upload, RotateCcw, Trash2, Bell, Monitor, Moon, Sun, RefreshCw, Copy, Check, Cloud, CloudOff } from 'lucide-react'
import { TabsRoot, TabsList, TabsTrigger, TabsContent } from '@/components/common/Tabs'
import { Switch } from '@/components/common/Switch'
import { Select } from '@/components/common/Select'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { useSettings, updateSettings } from '@/data/settings'
import { exportAllData, downloadExport, importData, resetAllData, emptyTrash } from '@/data/exportImport'
import { pullAll, pushAllLocal, startRealtimeSync, stopRealtimeSync, syncConfigured } from '@/data/sync'
import { requestNotificationPermission, notificationsSupported } from '@/lib/notifications'
import { createId } from '@/lib/id'
import { toast } from '@/stores/toastStore'
import { cn } from '@/lib/cn'
import type { Priority, ThemeMode } from '@/data/types'

const THEME_OPTIONS: { value: ThemeMode; label: string; icon: React.ReactNode }[] = [
  { value: 'light', label: 'Light', icon: <Sun className="h-4 w-4" /> },
  { value: 'dark', label: 'Dark', icon: <Moon className="h-4 w-4" /> },
  { value: 'system', label: 'System', icon: <Monitor className="h-4 w-4" /> },
]

export default function SettingsPage() {
  const settings = useSettings()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [resetOpen, setResetOpen] = useState(false)
  const [emptyTrashOpen, setEmptyTrashOpen] = useState(false)
  const [importBusy, setImportBusy] = useState(false)
  const [joinCode, setJoinCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [syncBusy, setSyncBusy] = useState(false)

  if (!settings) return null

  const handleImportFile = async (file: File) => {
    setImportBusy(true)
    try {
      const text = await file.text()
      const json = JSON.parse(text)
      const result = await importData(json)
      if (result.success) {
        toast('Import complete', `Imported ${result.counts?.tasks ?? 0} tasks, ${result.counts?.projects ?? 0} projects`, 'success')
      } else {
        toast('Import failed', result.error, 'danger')
      }
    } catch {
      toast('Import failed', 'This file could not be read as JSON.', 'danger')
    } finally {
      setImportBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5 px-4 py-6 md:px-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-text-primary">Settings</h1>
        <p className="mt-1 text-sm text-text-secondary">Configure Flowline to work the way you do.</p>
      </div>

      <TabsRoot defaultValue="appearance">
        <TabsList>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="productivity">Productivity</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="sync">Sync</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>

        <TabsContent value="appearance" className="space-y-5 pt-5">
          <Field label="Theme" description="Choose how Flowline looks.">
            <div className="flex gap-2">
              {THEME_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => updateSettings({ theme: opt.value })}
                  className={cn(
                    'flex flex-1 flex-col items-center gap-1.5 rounded-lg border px-3 py-3 text-xs font-medium',
                    settings.theme === opt.value ? 'border-accent bg-accent-subtle-bg text-accent-subtle-text' : 'border-border-subtle text-text-secondary hover:bg-hover',
                  )}
                >
                  {opt.icon} {opt.label}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Compact mode" description="Reduce spacing for denser layouts.">
            <Switch checked={settings.compactMode} onCheckedChange={(v) => updateSettings({ compactMode: v })} />
          </Field>

          <Field label="Collapse sidebar by default" description="Start with a narrower sidebar.">
            <Switch checked={settings.sidebarCollapsed} onCheckedChange={(v) => updateSettings({ sidebarCollapsed: v })} />
          </Field>
        </TabsContent>

        <TabsContent value="productivity" className="space-y-5 pt-5">
          <Field label="Default priority" description="Applied to new tasks unless specified.">
            <Select
              value={settings.defaultPriority ?? 'none'}
              onValueChange={(v) => updateSettings({ defaultPriority: v === 'none' ? null : (v as Priority) })}
              options={[
                { value: 'none', label: 'No priority' },
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
                { value: 'urgent', label: 'Urgent' },
              ]}
              className="max-w-[180px]"
            />
          </Field>

          <Field label="Default task duration" description="Used as a fallback time estimate.">
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={5}
                value={settings.defaultDurationMinutes}
                onChange={(e) => updateSettings({ defaultDurationMinutes: parseInt(e.target.value) || 30 })}
                className="w-24"
              />
              <span className="text-sm text-text-secondary">minutes</span>
            </div>
          </Field>

          <Field label="Start of week" description="First day shown in Calendar and week views.">
            <Select
              value={String(settings.startOfWeek)}
              onValueChange={(v) => updateSettings({ startOfWeek: (parseInt(v) as 0 | 1) })}
              options={[
                { value: '1', label: 'Monday' },
                { value: '0', label: 'Sunday' },
              ]}
              className="max-w-[180px]"
            />
          </Field>

          <Field label="Working hours" description="Used to shape your daily planning view.">
            <div className="flex items-center gap-2">
              <Input
                type="time"
                value={settings.workingHours.start}
                onChange={(e) => updateSettings({ workingHours: { ...settings.workingHours, start: e.target.value } })}
                className="w-32"
              />
              <span className="text-sm text-text-secondary">to</span>
              <Input
                type="time"
                value={settings.workingHours.end}
                onChange={(e) => updateSettings({ workingHours: { ...settings.workingHours, end: e.target.value } })}
                className="w-32"
              />
            </div>
          </Field>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-5 pt-5">
          <Field label="Enable notifications" description={notificationsSupported() ? 'Get reminders for due tasks in your browser.' : 'Browser notifications are not supported here — in-app reminders will still show.'}>
            <Switch
              checked={settings.notificationsEnabled}
              onCheckedChange={async (v) => {
                if (v) await requestNotificationPermission()
                await updateSettings({ notificationsEnabled: v })
              }}
            />
          </Field>
          <Field label="Reminder lead time" description="How far in advance to notify you.">
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={0}
                value={settings.reminderLeadMinutes}
                onChange={(e) => updateSettings({ reminderLeadMinutes: parseInt(e.target.value) || 0 })}
                className="w-24"
              />
              <span className="text-sm text-text-secondary">minutes before</span>
            </div>
          </Field>
          <div className="flex items-start gap-2 rounded-lg bg-inset p-3 text-xs text-text-secondary">
            <Bell className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Notifications run entirely on-device — no external push service is used.
          </div>
        </TabsContent>

        <TabsContent value="sync" className="space-y-5 pt-5">
          {!syncConfigured ? (
            <div className="flex items-start gap-2 rounded-lg bg-inset p-4 text-sm text-text-secondary">
              <CloudOff className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-medium text-text-primary">Sync isn't configured for this deployment.</p>
                <p className="mt-1 text-xs">
                  Flowline is running purely local-first — all data stays on this device. To enable cross-device sync, a Supabase project URL
                  and anon key need to be set at build time.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div
                className={cn(
                  'flex items-start gap-2 rounded-lg p-3 text-xs',
                  settings.syncEnabled ? 'bg-success-subtle-bg text-success' : 'bg-inset text-text-secondary',
                )}
              >
                {settings.syncEnabled ? <Cloud className="mt-0.5 h-3.5 w-3.5 shrink-0" /> : <CloudOff className="mt-0.5 h-3.5 w-3.5 shrink-0" />}
                {settings.syncEnabled
                  ? 'Sync is on. Changes on this device push to your workspace, and changes elsewhere arrive live.'
                  : 'Sync is off. This device only sees its own local data.'}
              </div>

              <Field label="Enable sync" description="Push this device's data to your workspace and receive live updates from others.">
                <Switch
                  checked={settings.syncEnabled}
                  onCheckedChange={async (v) => {
                    setSyncBusy(true)
                    try {
                      await updateSettings({ syncEnabled: v })
                      if (v) {
                        await pushAllLocal()
                        await pullAll()
                        await startRealtimeSync()
                        toast('Sync enabled', 'This device is now syncing.')
                      } else {
                        stopRealtimeSync()
                        toast('Sync disabled')
                      }
                    } finally {
                      setSyncBusy(false)
                    }
                  }}
                />
              </Field>

              <Field label="Workspace code" description="Enter this same code on another device to sync them together.">
                <div className="flex items-center gap-2">
                  <Input readOnly value={settings.workspaceId} className="w-56 font-mono text-xs" onFocus={(e) => e.target.select()} />
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(settings.workspaceId)
                      setCopied(true)
                      window.setTimeout(() => setCopied(false), 1500)
                    }}
                  >
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  </Button>
                </div>
              </Field>

              {settings.syncEnabled && (
                <Field label="Sync now" description="Manually push and pull, if you don't want to wait for the next automatic sync.">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={syncBusy}
                    onClick={async () => {
                      setSyncBusy(true)
                      try {
                        await pushAllLocal()
                        await pullAll()
                        toast('Synced')
                      } finally {
                        setSyncBusy(false)
                      }
                    }}
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Sync now
                  </Button>
                </Field>
              )}

              <div className="rounded-lg border border-border-subtle bg-surface p-4">
                <h3 className="text-sm font-medium text-text-primary">Join a different workspace</h3>
                <p className="mt-1 text-xs text-text-secondary">
                  Paste a workspace code from another device to link them. This merges that workspace's data with what's already on this
                  device — if this device already has data you don't want mixed in, reset it first (Data tab) before joining.
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <Input value={joinCode} onChange={(e) => setJoinCode(e.target.value)} placeholder="Paste workspace code…" className="flex-1 font-mono text-xs" />
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={!joinCode.trim() || syncBusy}
                    onClick={async () => {
                      setSyncBusy(true)
                      try {
                        stopRealtimeSync()
                        await updateSettings({ workspaceId: joinCode.trim(), syncEnabled: true })
                        await pullAll()
                        await startRealtimeSync()
                        toast('Joined workspace', 'Pulled in data from the shared workspace.')
                        setJoinCode('')
                      } finally {
                        setSyncBusy(false)
                      }
                    }}
                  >
                    Join
                  </Button>
                </div>
              </div>

              <div className="rounded-lg border border-border-subtle bg-surface p-4">
                <h3 className="text-sm font-medium text-text-primary">Start a new, separate workspace</h3>
                <p className="mt-1 text-xs text-text-secondary">Generates a fresh workspace code, unlinking this device from any shared workspace.</p>
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-3"
                  onClick={async () => {
                    stopRealtimeSync()
                    await updateSettings({ workspaceId: createId(), syncEnabled: false })
                    toast('New workspace created')
                  }}
                >
                  New workspace
                </Button>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="data" className="space-y-5 pt-5">
          <Field label="Export data" description="Download everything as a JSON backup file.">
            <Button
              variant="secondary"
              onClick={async () => {
                downloadExport(await exportAllData())
                toast('Backup downloaded')
              }}
            >
              <Download className="h-4 w-4" /> Export
            </Button>
          </Field>

          <Field label="Import data" description="Restore from a previously exported backup. This replaces all current data.">
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleImportFile(e.target.files[0])}
              />
              <Button variant="secondary" onClick={() => fileInputRef.current?.click()} disabled={importBusy}>
                <Upload className="h-4 w-4" /> {importBusy ? 'Importing…' : 'Import'}
              </Button>
            </div>
          </Field>

          <Field label="Empty trash" description="Permanently delete everything currently in Trash.">
            <Button variant="secondary" onClick={() => setEmptyTrashOpen(true)}>
              <Trash2 className="h-4 w-4" /> Empty trash
            </Button>
          </Field>

          <div className="rounded-lg border border-danger-subtle-bg bg-danger-subtle-bg/40 p-4">
            <h3 className="text-sm font-semibold text-danger">Danger zone</h3>
            <p className="mt-1 text-xs text-text-secondary">Permanently erase all projects, tasks, notes, and settings. This cannot be undone.</p>
            <Button variant="danger" size="sm" className="mt-3" onClick={() => setResetOpen(true)}>
              <RotateCcw className="h-4 w-4" /> Reset all data
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="about" className="space-y-3 pt-5">
          <div className="rounded-xl border border-border-subtle bg-surface p-4">
            <h3 className="font-display text-sm font-semibold text-text-primary">Flowline</h3>
            <p className="mt-1 text-xs text-text-tertiary">Version 1.0.0</p>
            <p className="mt-3 text-sm text-text-secondary">
              A local-first personal project and task manager. All data lives in your browser's IndexedDB storage, and the app works fully
              offline with no account and no paid services required.
              {syncConfigured
                ? ' Optional cross-device sync (Sync tab) is available for this deployment, backed by a free-tier Supabase project.'
                : ' This deployment has no sync configured — data never leaves this device.'}
            </p>
          </div>
        </TabsContent>
      </TabsRoot>

      <ConfirmDialog
        open={emptyTrashOpen}
        onOpenChange={setEmptyTrashOpen}
        title="Empty trash?"
        description="Everything in Trash will be permanently deleted. This cannot be undone."
        confirmLabel="Empty trash"
        onConfirm={async () => {
          await emptyTrash()
          toast('Trash emptied')
        }}
      />

      <ConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title="Reset all data?"
        description="This permanently deletes every project, task, note, and label, and restores default settings."
        confirmLabel="Reset everything"
        requireTypedConfirmation="RESET"
        onConfirm={async () => {
          await resetAllData()
          toast('All data has been reset')
        }}
      />
    </div>
  )
}

function Field({ label, description, children }: { label: string; description: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border-subtle bg-surface p-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-text-primary">{label}</p>
        <p className="mt-0.5 text-xs text-text-secondary">{description}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}
