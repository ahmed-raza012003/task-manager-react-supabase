import { Command } from 'cmdk'
import { useNavigate } from 'react-router-dom'
import {
  BarChart3,
  Calendar,
  Download,
  Home,
  LayoutGrid,
  ListTodo,
  Moon,
  Plus,
  Settings,
  StickyNote,
  Sun,
  Tag,
} from 'lucide-react'
import { useCommandPaletteStore } from '@/stores/commandPaletteStore'
import { useQuickAddStore } from '@/stores/quickAddStore'
import { useProjectDialogStore } from '@/stores/projectDialogStore'
import { updateSettings, useSettings } from '@/data/settings'
import { exportAllData, downloadExport } from '@/data/exportImport'
import { useProjects } from '@/data/projects'

export function CommandPalette() {
  const isOpen = useCommandPaletteStore((s) => s.isOpen)
  const close = useCommandPaletteStore((s) => s.close)
  const navigate = useNavigate()
  const openQuickAdd = useQuickAddStore((s) => s.open)
  const openProjectDialog = useProjectDialogStore((s) => s.open)
  const settings = useSettings()
  const projects = useProjects() ?? []

  const run = (fn: () => void) => {
    fn()
    close()
  }

  return (
    <Command.Dialog
      open={isOpen}
      onOpenChange={(o) => !o && close()}
      label="Command palette"
      overlayClassName="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] data-[state=open]:animate-[fadeIn_150ms_ease-out]"
      className="fixed left-1/2 top-[18%] z-50 w-full max-w-xl -translate-x-1/2 overflow-hidden rounded-xl border border-border-subtle bg-surface-raised shadow-token-lg"
    >
      <Command.Input
        placeholder="Type a command or search…"
        className="w-full border-b border-border-subtle bg-transparent px-4 py-3 text-sm text-text-primary outline-none placeholder:text-text-tertiary"
      />
      <Command.List className="max-h-96 overflow-y-auto p-2">
        <Command.Empty className="py-8 text-center text-sm text-text-tertiary">No results found.</Command.Empty>

        <Command.Group heading="Create" className="px-1 pb-1 text-[11px] font-semibold uppercase tracking-wide text-text-tertiary [&_[cmdk-group-items]]:mt-1">
          <Item onSelect={() => run(() => openQuickAdd())} icon={<Plus className="h-4 w-4" />}>
            Create a task
          </Item>
          <Item onSelect={() => run(() => openProjectDialog())} icon={<LayoutGrid className="h-4 w-4" />}>
            Create a project
          </Item>
        </Command.Group>

        <Command.Group heading="Navigate" className="px-1 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-text-tertiary [&_[cmdk-group-items]]:mt-1">
          <Item onSelect={() => run(() => navigate('/'))} icon={<Home className="h-4 w-4" />}>
            Go to Dashboard
          </Item>
          <Item onSelect={() => run(() => navigate('/today'))} icon={<Sun className="h-4 w-4" />}>
            Go to Today
          </Item>
          <Item onSelect={() => run(() => navigate('/tasks'))} icon={<ListTodo className="h-4 w-4" />}>
            Go to My Tasks
          </Item>
          <Item onSelect={() => run(() => navigate('/projects'))} icon={<LayoutGrid className="h-4 w-4" />}>
            Go to Projects
          </Item>
          <Item onSelect={() => run(() => navigate('/calendar'))} icon={<Calendar className="h-4 w-4" />}>
            Go to Calendar
          </Item>
          <Item onSelect={() => run(() => navigate('/notes'))} icon={<StickyNote className="h-4 w-4" />}>
            Go to Notes
          </Item>
          <Item onSelect={() => run(() => navigate('/analytics'))} icon={<BarChart3 className="h-4 w-4" />}>
            Go to Analytics
          </Item>
          <Item onSelect={() => run(() => navigate('/labels'))} icon={<Tag className="h-4 w-4" />}>
            Go to Labels
          </Item>
        </Command.Group>

        {projects.length > 0 && (
          <Command.Group heading="Projects" className="px-1 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-text-tertiary [&_[cmdk-group-items]]:mt-1">
            {projects.map((p) => (
              <Item key={p.id} onSelect={() => run(() => navigate(`/projects/${p.id}`))} icon={<span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />}>
                {p.name}
              </Item>
            ))}
          </Command.Group>
        )}

        <Command.Group heading="Settings" className="px-1 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-text-tertiary [&_[cmdk-group-items]]:mt-1">
          <Item
            onSelect={() => run(() => updateSettings({ theme: settings?.theme === 'dark' ? 'light' : 'dark' }))}
            icon={settings?.theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          >
            Toggle dark mode
          </Item>
          <Item onSelect={() => run(() => navigate('/settings'))} icon={<Settings className="h-4 w-4" />}>
            Open settings
          </Item>
          <Item onSelect={() => run(async () => downloadExport(await exportAllData()))} icon={<Download className="h-4 w-4" />}>
            Export data
          </Item>
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  )
}

function Item({ children, icon, onSelect }: { children: React.ReactNode; icon: React.ReactNode; onSelect: () => void }) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-text-primary aria-selected:bg-accent-subtle-bg aria-selected:text-accent-subtle-text"
    >
      {icon}
      {children}
    </Command.Item>
  )
}
