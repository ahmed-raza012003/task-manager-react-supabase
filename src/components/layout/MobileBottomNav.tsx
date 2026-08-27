import { NavLink } from 'react-router-dom'
import { Home, ListTodo, Plus, Sun, LayoutGrid, Calendar } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useQuickAddStore } from '@/stores/quickAddStore'

const items = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/today', label: 'Today', icon: Sun, end: false },
  { to: '/tasks', label: 'Tasks', icon: ListTodo, end: false },
  { to: '/projects', label: 'Projects', icon: LayoutGrid, end: false },
  { to: '/calendar', label: 'Calendar', icon: Calendar, end: false },
]

export function MobileBottomNav() {
  const openQuickAdd = useQuickAddStore((s) => s.open)

  return (
    <>
      <button
        onClick={() => openQuickAdd()}
        className="fixed bottom-[76px] right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-token-lg active:scale-95 md:hidden"
        aria-label="Quick add task"
      >
        <Plus className="h-6 w-6" />
      </button>

      <nav className="fixed bottom-0 left-0 right-0 z-30 flex h-16 items-stretch border-t border-border-subtle bg-surface-raised pb-[env(safe-area-inset-bottom)] md:hidden">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium',
                isActive ? 'text-accent' : 'text-text-tertiary',
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </>
  )
}
