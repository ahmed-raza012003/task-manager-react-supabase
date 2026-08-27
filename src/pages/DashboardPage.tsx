import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Clock, Flame, FolderKanban, ListTodo, Percent, Plus, TrendingUp } from 'lucide-react'
import { StatCard } from '@/components/analytics/StatCard'
import { TaskCard } from '@/components/tasks/TaskCard'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { EmptyState } from '@/components/common/EmptyState'
import { Button } from '@/components/common/Button'
import { useDashboardStats } from '@/data/analytics'
import { useAllTasks } from '@/data/tasks'
import { useActiveProjects } from '@/data/projects'
import { useQuickAddStore } from '@/stores/quickAddStore'
import { useProjectDialogStore } from '@/stores/projectDialogStore'
import { formatDuration, greeting, formatFullDate, isPastDateKey, isTodayKey } from '@/lib/dateHelpers'

export default function DashboardPage() {
  const stats = useDashboardStats()
  const tasks = useAllTasks() ?? []
  const activeProjects = useActiveProjects() ?? []
  const openQuickAdd = useQuickAddStore((s) => s.open)
  const openProjectDialog = useProjectDialogStore((s) => s.open)
  const navigate = useNavigate()

  const todayTasks = tasks.filter((t) => t.status !== 'done' && isTodayKey(t.dueDate)).slice(0, 5)
  const overdueTasks = tasks.filter((t) => t.status !== 'done' && isPastDateKey(t.dueDate)).slice(0, 5)

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 md:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-text-primary sm:text-[28px]">{greeting()}, Ahmed 👋</h1>
          <p className="mt-1 text-sm text-text-secondary">{formatFullDate()} · Here's what needs your attention today.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => openProjectDialog()}>
            <FolderKanban className="h-4 w-4" /> New project
          </Button>
          <Button variant="primary" onClick={() => openQuickAdd()}>
            <Plus className="h-4 w-4" /> Quick add
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Today's tasks" value={stats.todayCount} icon={<ListTodo className="h-3.5 w-3.5" />} tone="accent" to="/today" />
        <StatCard label="Completed today" value={stats.completedTodayCount} icon={<CheckCircle2 className="h-3.5 w-3.5" />} tone="success" to="/tasks" />
        <StatCard label="Overdue" value={stats.overdueCount} icon={<Flame className="h-3.5 w-3.5" />} tone="danger" to="/tasks" />
        <StatCard label="Due soon" value={stats.dueSoonCount} icon={<TrendingUp className="h-3.5 w-3.5" />} tone="warning" to="/tasks" />
        <StatCard label="Active projects" value={stats.activeProjectsCount} icon={<FolderKanban className="h-3.5 w-3.5" />} tone="accent" to="/projects" />
        <StatCard label="Completion rate" value={`${stats.completionRate}%`} icon={<Percent className="h-3.5 w-3.5" />} tone="success" to="/analytics" />
        <StatCard label="Current streak" value={`${stats.currentStreak}d`} icon={<Flame className="h-3.5 w-3.5" />} tone="warning" to="/analytics" />
        <StatCard label="Time tracked" value={formatDuration(stats.timeTrackedTodaySeconds)} icon={<Clock className="h-3.5 w-3.5" />} tone="accent" to="/analytics" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-text-primary">Today</h2>
            <button onClick={() => navigate('/today')} className="text-xs font-medium text-accent hover:underline">
              View all
            </button>
          </div>
          {todayTasks.length === 0 ? (
            <EmptyState title="Nothing due today" description="Enjoy the clear runway, or plan ahead." />
          ) : (
            <div className="space-y-2">
              {todayTasks.map((t) => (
                <TaskCard key={t.id} task={t} showProject />
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-text-primary">Overdue</h2>
            <button onClick={() => navigate('/tasks')} className="text-xs font-medium text-accent hover:underline">
              View all
            </button>
          </div>
          {overdueTasks.length === 0 ? (
            <EmptyState title="You're clear" description="Nothing is overdue right now." />
          ) : (
            <div className="space-y-2">
              {overdueTasks.map((t) => (
                <TaskCard key={t.id} task={t} showProject />
              ))}
            </div>
          )}
        </section>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-base font-semibold text-text-primary">Active projects</h2>
          <button onClick={() => navigate('/projects')} className="text-xs font-medium text-accent hover:underline">
            View all
          </button>
        </div>
        {activeProjects.length === 0 ? (
          <EmptyState title="No active projects" description="Create a project to start organizing your work." />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {activeProjects.slice(0, 6).map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
