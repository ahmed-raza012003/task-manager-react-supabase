import { useEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import {
  BarChart3,
  Calendar,
  ChevronsLeft,
  Home,
  LayoutGrid,
  ListTodo,
  Plus,
  Settings,
  Sun,
  Tag,
  Trash2,
  StickyNote,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { useUIStore } from '@/stores/uiStore'
import { useDashboardStats } from '@/data/analytics'
import { useQuickAddStore } from '@/stores/quickAddStore'
import { useSettings, updateSettings } from '@/data/settings'
import { Tooltip } from '@/components/common/Tooltip'
import type { ReactNode } from 'react'

interface NavItem {
  to: string
  label: string
  icon: ReactNode
  badge?: number
  badgeTone?: 'accent' | 'danger'
}

export function Sidebar() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed)
  const setSidebarCollapsed = useUIStore((s) => s.setSidebarCollapsed)
  const stats = useDashboardStats()
  const openQuickAdd = useQuickAddStore((s) => s.open)
  const settings = useSettings()
  const syncedFromSettings = useRef(false)

  useEffect(() => {
    if (settings && !syncedFromSettings.current) {
      setSidebarCollapsed(settings.sidebarCollapsed)
      syncedFromSettings.current = true
    }
  }, [settings, setSidebarCollapsed])

  const toggleSidebar = () => {
    const next = !collapsed
    setSidebarCollapsed(next)
    updateSettings({ sidebarCollapsed: next })
  }

  const workspaceItems: NavItem[] = [
    { to: '/', label: 'Dashboard', icon: <Home className="h-[18px] w-[18px]" /> },
    { to: '/today', label: 'Today', icon: <Sun className="h-[18px] w-[18px]" />, badge: stats.todayCount, badgeTone: 'accent' },
    { to: '/tasks', label: 'My Tasks', icon: <ListTodo className="h-[18px] w-[18px]" />, badge: stats.overdueCount, badgeTone: 'danger' },
    { to: '/projects', label: 'Projects', icon: <LayoutGrid className="h-[18px] w-[18px]" /> },
    { to: '/calendar', label: 'Calendar', icon: <Calendar className="h-[18px] w-[18px]" /> },
    { to: '/notes', label: 'Notes', icon: <StickyNote className="h-[18px] w-[18px]" /> },
    { to: '/analytics', label: 'Analytics', icon: <BarChart3 className="h-[18px] w-[18px]" /> },
  ]

  const orgItems: NavItem[] = [
    { to: '/labels', label: 'Labels', icon: <Tag className="h-[18px] w-[18px]" /> },
    { to: '/trash', label: 'Trash', icon: <Trash2 className="h-[18px] w-[18px]" /> },
  ]

  return (
    <aside
      className={cn(
        'hidden shrink-0 flex-col border-r border-border-subtle bg-canvas transition-[width] duration-200 md:flex',
        collapsed ? 'w-[68px]' : 'w-64',
      )}
    >
      <div className={cn('flex h-14 items-center gap-2 px-4', collapsed && 'justify-center px-0')}>
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-accent font-display text-sm font-bold text-white">
          F
        </div>
        {!collapsed && <span className="font-display text-[15px] font-semibold text-text-primary">Flowline</span>}
      </div>

      <div className={cn('px-3 pb-3', collapsed && 'px-2')}>
        <Tooltip content={collapsed ? 'Quick Add (C)' : ''}>
          <button
            onClick={() => openQuickAdd()}
            className={cn(
              'flex h-9 w-full items-center gap-2 rounded-md bg-accent px-3 text-sm font-medium text-white shadow-token-sm transition-transform hover:bg-accent-hover active:scale-[0.98]',
              collapsed && 'justify-center px-0',
            )}
          >
            <Plus className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Quick Add</span>}
          </button>
        </Tooltip>
      </div>

      <nav className="flex-1 overflow-y-auto px-3">
        <NavGroup label={collapsed ? undefined : 'Workspace'} items={workspaceItems} collapsed={collapsed} />
        <NavGroup label={collapsed ? undefined : 'Organization'} items={orgItems} collapsed={collapsed} />
      </nav>

      <div className="border-t border-border-subtle p-3">
        <NavGroup items={[{ to: '/settings', label: 'Settings', icon: <Settings className="h-[18px] w-[18px]" /> }]} collapsed={collapsed} />
        <button
          onClick={toggleSidebar}
          className={cn(
            'mt-1 flex h-9 w-full items-center gap-2 rounded-md px-2.5 text-sm text-text-tertiary transition-colors hover:bg-hover hover:text-text-primary',
            collapsed && 'justify-center px-0',
          )}
        >
          <ChevronsLeft className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  )
}

function NavGroup({ label, items, collapsed }: { label?: string; items: NavItem[]; collapsed: boolean }) {
  return (
    <div className="mb-4">
      {label && <div className="px-2.5 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">{label}</div>}
      <div className="space-y-0.5">
        {items.map((item) => (
          <Tooltip key={item.to} content={collapsed ? item.label : ''} side="right">
            <NavLink
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex h-9 items-center gap-2.5 rounded-md px-2.5 text-sm font-medium transition-colors',
                  collapsed && 'justify-center px-0',
                  isActive ? 'bg-accent-subtle-bg text-accent-subtle-text' : 'text-text-secondary hover:bg-hover hover:text-text-primary',
                )
              }
            >
              {item.icon}
              {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
              {!collapsed && !!item.badge && (
                <span
                  className={cn(
                    'rounded-full px-1.5 py-0.5 text-[11px] font-semibold leading-none',
                    item.badgeTone === 'danger' ? 'bg-danger-subtle-bg text-danger' : 'bg-accent-subtle-bg text-accent-subtle-text',
                  )}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          </Tooltip>
        ))}
      </div>
    </div>
  )
}
