import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import * as Icons from 'lucide-react'
import { ArrowLeft, Pencil, Plus } from 'lucide-react'
import { TabsRoot, TabsList, TabsTrigger, TabsContent } from '@/components/common/Tabs'
import { ProgressBar } from '@/components/common/ProgressBar'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { TaskCard } from '@/components/tasks/TaskCard'
import { EmptyState } from '@/components/common/EmptyState'
import { KanbanBoard } from '@/components/kanban/KanbanBoard'
import { CalendarGrid } from '@/components/calendar/CalendarGrid'
import { NoteCard } from '@/components/notes/NoteCard'
import { NoteEditor } from '@/components/notes/NoteEditor'
import { useProject, useProjectStats } from '@/data/projects'
import { useProjectTasks } from '@/data/tasks'
import { useNotes, createNote } from '@/data/notes'
import { useEntityActivity } from '@/data/activityLog'
import { useSettings } from '@/data/settings'
import { useProjectDialogStore } from '@/stores/projectDialogStore'
import { useQuickAddStore } from '@/stores/quickAddStore'
import { friendlyDateLabel } from '@/lib/dateHelpers'
import { priorityLabel } from '@/lib/colors'
import type { LucideIcon } from 'lucide-react'

export default function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const project = useProject(projectId ?? null)
  const stats = useProjectStats(projectId ?? null)
  const tasks = useProjectTasks(projectId ?? null) ?? []
  const notes = useNotes({ projectId: projectId ?? null }) ?? []
  const activity = useEntityActivity('project', projectId ?? null) ?? []
  const settings = useSettings()
  const navigate = useNavigate()
  const openProjectDialog = useProjectDialogStore((s) => s.open)
  const openQuickAdd = useQuickAddStore((s) => s.open)
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)

  if (!project || !projectId) {
    return (
      <div className="p-8">
        <EmptyState title="Project not found" description="It may have been deleted or moved to trash." />
      </div>
    )
  }

  const Icon = (Icons[project.icon as keyof typeof Icons] as LucideIcon) ?? Icons.Rocket
  const openTasks = tasks.filter((t) => t.status !== 'done')
  const upcoming = openTasks.filter((t) => t.dueDate).sort((a, b) => (a.dueDate ?? '').localeCompare(b.dueDate ?? '')).slice(0, 5)
  const highPriority = openTasks.filter((t) => t.priority === 'urgent' || t.priority === 'high')

  return (
    <div className="mx-auto max-w-6xl space-y-5 px-4 py-6 md:px-8">
      <button onClick={() => navigate('/projects')} className="flex items-center gap-1.5 text-xs font-medium text-text-tertiary hover:text-text-primary">
        <ArrowLeft className="h-3.5 w-3.5" /> Projects
      </button>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: `${project.color}1A`, color: project.color }}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-semibold text-text-primary">{project.name}</h1>
            {project.description && <p className="mt-1 max-w-xl text-sm text-text-secondary">{project.description}</p>}
          </div>
        </div>
        <Button variant="secondary" onClick={() => openProjectDialog(project.id)}>
          <Pencil className="h-4 w-4" /> Edit
        </Button>
      </div>

      <TabsRoot defaultValue="board">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="board">Board</TabsTrigger>
          <TabsTrigger value="list">List</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="pt-5">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-5">
              <div className="rounded-xl border border-border-subtle bg-surface p-4">
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-medium text-text-secondary">Progress</span>
                  <span className="font-semibold text-text-primary">{stats.progress}%</span>
                </div>
                <ProgressBar value={stats.progress} />
                <p className="mt-1.5 text-xs text-text-tertiary">{stats.completed} / {stats.total} tasks completed</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <Badge>{project.status.replace('_', ' ')}</Badge>
                  {project.dueDate && <Badge>Due {friendlyDateLabel(project.dueDate)}</Badge>}
                  {project.priority && <Badge tone="warning">{priorityLabel(project.priority)} priority</Badge>}
                  {stats.highPriority > 0 && <Badge tone="danger">{stats.highPriority} high priority open</Badge>}
                </div>
              </div>

              <div>
                <h3 className="mb-2 font-display text-sm font-semibold text-text-primary">Upcoming tasks</h3>
                {upcoming.length === 0 ? (
                  <EmptyState title="Nothing scheduled" description="No upcoming deadlines in this project." />
                ) : (
                  <div className="space-y-2">
                    {upcoming.map((t) => (
                      <TaskCard key={t.id} task={t} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-border-subtle bg-surface p-4">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-tertiary">High priority</h3>
                {highPriority.length === 0 ? (
                  <p className="text-sm text-text-tertiary">None right now.</p>
                ) : (
                  <div className="space-y-1.5">
                    {highPriority.slice(0, 5).map((t) => (
                      <p key={t.id} className="truncate text-sm text-text-primary">
                        {t.title}
                      </p>
                    ))}
                  </div>
                )}
              </div>
              <div className="rounded-xl border border-border-subtle bg-surface p-4">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-tertiary">Recent activity</h3>
                {activity.length === 0 ? (
                  <p className="text-sm text-text-tertiary">No activity yet.</p>
                ) : (
                  <div className="space-y-1.5">
                    {activity.slice(0, 5).map((a) => (
                      <p key={a.logId} className="text-xs text-text-secondary">
                        {a.message}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="board" className="pt-5">
          <div className="h-[calc(100vh-320px)] min-h-[420px]">
            <KanbanBoard projectId={project.id} />
          </div>
        </TabsContent>

        <TabsContent value="list" className="pt-5">
          {tasks.length === 0 ? (
            <EmptyState title="No tasks yet" description="Add your first task to this project." />
          ) : (
            <div className="space-y-2">
              {tasks.map((t) => (
                <TaskCard key={t.id} task={t} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="calendar" className="pt-5">
          <CalendarGrid view="month" anchorDate={new Date()} tasks={tasks} weekStartsOn={settings?.startOfWeek ?? 1} />
        </TabsContent>

        <TabsContent value="notes" className="pt-5">
          <div className="mb-3 flex justify-end">
            <button
              onClick={() => createNote({ projectId: project.id, title: 'Untitled note' })}
              className="flex items-center gap-1 text-xs font-medium text-accent hover:underline"
            >
              <Plus className="h-3.5 w-3.5" /> Add note
            </button>
          </div>
          {notes.length === 0 ? (
            <EmptyState title="No notes yet" description="Capture ideas and context for this project." />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {notes.map((n) => (
                <NoteCard key={n.id} note={n} onOpen={() => setEditingNoteId(n.id)} />
              ))}
            </div>
          )}
          <NoteEditor noteId={editingNoteId} onClose={() => setEditingNoteId(null)} />
        </TabsContent>

        <TabsContent value="activity" className="pt-5">
          {activity.length === 0 ? (
            <EmptyState title="No activity yet" description="Actions on this project will show up here." />
          ) : (
            <div className="space-y-2">
              {activity.map((a) => (
                <div key={a.logId} className="rounded-lg border border-border-subtle bg-surface px-3 py-2 text-sm">
                  <span className="text-text-primary">{a.message}</span>
                  <span className="ml-2 text-xs text-text-tertiary">{new Date(a.createdAt).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </TabsRoot>

      <button
        onClick={() => openQuickAdd({ projectId: project.id })}
        className="fixed bottom-24 right-6 z-20 hidden items-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-medium text-white shadow-token-lg hover:bg-accent-hover md:flex"
      >
        <Plus className="h-4 w-4" /> Add task
      </button>
    </div>
  )
}
