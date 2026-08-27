import { Suspense, lazy, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import { TooltipProvider } from '@/components/common/Tooltip'
import { ToastContainer } from '@/components/common/Toast'
import { TaskDetailPanel } from '@/components/tasks/TaskDetailPanel'
import { QuickAddModal } from '@/components/tasks/QuickAddModal'
import { ProjectFormDialog } from '@/components/projects/ProjectForm'
import { CommandPalette } from '@/components/command/CommandPalette'
import { GlobalSearch } from '@/components/command/GlobalSearch'
import { ShortcutsHelpDialog } from '@/components/command/ShortcutsHelpDialog'
import { LoginScreen } from '@/components/auth/LoginScreen'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useReminderScheduler } from '@/hooks/useReminderScheduler'
import { initAuthListener } from '@/data/auth'
import { syncConfigured } from '@/lib/supabaseClient'
import { useAuthStore } from '@/stores/authStore'
import { Skeleton } from '@/components/common/Skeleton'

const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const TodayPage = lazy(() => import('@/pages/TodayPage'))
const MyTasksPage = lazy(() => import('@/pages/MyTasksPage'))
const ProjectsPage = lazy(() => import('@/pages/ProjectsPage'))
const ProjectDetailPage = lazy(() => import('@/pages/ProjectDetailPage'))
const CalendarPage = lazy(() => import('@/pages/CalendarPage'))
const NotesPage = lazy(() => import('@/pages/NotesPage'))
const LabelsPage = lazy(() => import('@/pages/LabelsPage'))
const AnalyticsPage = lazy(() => import('@/pages/AnalyticsPage'))
const SettingsPage = lazy(() => import('@/pages/SettingsPage'))
const TrashPage = lazy(() => import('@/pages/TrashPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

function PageFallback() {
  return (
    <div className="space-y-3 p-6">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  )
}

function GlobalProviders() {
  useKeyboardShortcuts()
  useReminderScheduler()

  return (
    <>
      <TaskDetailPanel />
      <QuickAddModal />
      <ProjectFormDialog />
      <CommandPalette />
      <GlobalSearch />
      <ShortcutsHelpDialog />
      <ToastContainer />
    </>
  )
}

function AppRoutes() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/today" element={<TodayPage />} />
          <Route path="/tasks" element={<MyTasksPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/labels" element={<LabelsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/trash" element={<TrashPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

function AppGate() {
  const session = useAuthStore((s) => s.session)
  const initialized = useAuthStore((s) => s.initialized)

  useEffect(() => {
    const unsubscribe = initAuthListener()
    return unsubscribe
  }, [])

  if (!syncConfigured) {
    return (
      <>
        <GlobalProviders />
        <AppRoutes />
      </>
    )
  }

  if (!initialized) return null
  if (!session) return <LoginScreen />

  return (
    <>
      <GlobalProviders />
      <AppRoutes />
    </>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <TooltipProvider>
        <AppGate />
      </TooltipProvider>
    </ThemeProvider>
  )
}
