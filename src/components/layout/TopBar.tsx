import { Search, Settings as SettingsIcon, Moon, Sun, Monitor } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useSearchStore } from '@/stores/commandPaletteStore'
import { useSettings, updateSettings } from '@/data/settings'
import {
  DropdownMenuRoot,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/common/DropdownMenu'
import { NotificationCenter } from '@/components/notifications/NotificationCenter'

export function TopBar() {
  const openSearch = useSearchStore((s) => s.open)
  const settings = useSettings()
  const navigate = useNavigate()

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border-subtle bg-canvas px-4 md:px-6">
      <div className="flex-1">
        <button
          onClick={() => openSearch()}
          className="flex h-9 w-full max-w-sm items-center gap-2 rounded-md border border-border-subtle bg-surface px-3 text-sm text-text-tertiary transition-colors hover:border-border-strong"
        >
          <Search className="h-4 w-4" />
          <span className="flex-1 text-left">Search everything…</span>
          <kbd className="rounded border border-border-subtle bg-inset px-1.5 py-0.5 text-[10px] font-medium text-text-tertiary">/</kbd>
        </button>
      </div>

      <NotificationCenter />

      <DropdownMenuRoot>
        <DropdownMenuTrigger asChild>
          <button className="flex h-8 w-8 items-center justify-center rounded-full bg-accent font-display text-xs font-semibold text-white">
            A
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Appearance</DropdownMenuLabel>
          <DropdownMenuItem onSelect={() => updateSettings({ theme: 'light' })}>
            <Sun className="h-4 w-4" /> Light
            {settings?.theme === 'light' && <span className="ml-auto text-accent">•</span>}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => updateSettings({ theme: 'dark' })}>
            <Moon className="h-4 w-4" /> Dark
            {settings?.theme === 'dark' && <span className="ml-auto text-accent">•</span>}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => updateSettings({ theme: 'system' })}>
            <Monitor className="h-4 w-4" /> System
            {settings?.theme === 'system' && <span className="ml-auto text-accent">•</span>}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => navigate('/settings')}>
            <SettingsIcon className="h-4 w-4" /> Settings
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenuRoot>
    </header>
  )
}
