import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { MobileBottomNav } from './MobileBottomNav'

export function AppShell() {
  return (
    <div className="flex h-dvh w-full overflow-hidden bg-canvas text-text-primary">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <Outlet />
        </main>
      </div>
      <MobileBottomNav />
    </div>
  )
}
