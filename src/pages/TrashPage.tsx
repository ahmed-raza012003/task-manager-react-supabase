import { Trash2, RotateCcw, X } from 'lucide-react'
import { TabsRoot, TabsList, TabsTrigger, TabsContent } from '@/components/common/Tabs'
import { EmptyState } from '@/components/common/EmptyState'
import { PriorityDot } from '@/components/common/PriorityDot'
import { useTrashedTasks, restoreTask, permanentlyDeleteTask } from '@/data/tasks'
import { useTrashedProjects, restoreProject, permanentlyDeleteProject } from '@/data/projects'
import { useTrashedNotes, restoreNote, permanentlyDeleteNote } from '@/data/notes'
import { toast } from '@/stores/toastStore'

export default function TrashPage() {
  const tasks = useTrashedTasks() ?? []
  const projects = useTrashedProjects() ?? []
  const notes = useTrashedNotes() ?? []

  return (
    <div className="mx-auto max-w-3xl space-y-5 px-4 py-6 md:px-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-text-primary">Trash</h1>
        <p className="mt-1 text-sm text-text-secondary">Items here can be restored, or permanently deleted from Settings → Data.</p>
      </div>

      <TabsRoot defaultValue="tasks">
        <TabsList>
          <TabsTrigger value="tasks">Tasks ({tasks.length})</TabsTrigger>
          <TabsTrigger value="projects">Projects ({projects.length})</TabsTrigger>
          <TabsTrigger value="notes">Notes ({notes.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="pt-4">
          {tasks.length === 0 ? (
            <EmptyState icon={<Trash2 className="h-6 w-6" />} title="Trash is empty" description="Deleted tasks will show up here." />
          ) : (
            <div className="space-y-2">
              {tasks.map((t) => (
                <div key={t.id} className="flex items-center gap-2 rounded-lg border border-border-subtle bg-surface px-3 py-2.5">
                  <PriorityDot priority={t.priority} />
                  <span className="flex-1 truncate text-sm text-text-primary">{t.title}</span>
                  <button
                    onClick={async () => {
                      await restoreTask(t.id)
                      toast('Task restored')
                    }}
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-accent hover:bg-accent-subtle-bg"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Restore
                  </button>
                  <button
                    onClick={() => permanentlyDeleteTask(t.id)}
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-danger hover:bg-danger-subtle-bg"
                  >
                    <X className="h-3.5 w-3.5" /> Delete forever
                  </button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="projects" className="pt-4">
          {projects.length === 0 ? (
            <EmptyState icon={<Trash2 className="h-6 w-6" />} title="Trash is empty" description="Deleted projects will show up here." />
          ) : (
            <div className="space-y-2">
              {projects.map((p) => (
                <div key={p.id} className="flex items-center gap-2 rounded-lg border border-border-subtle bg-surface px-3 py-2.5">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
                  <span className="flex-1 truncate text-sm text-text-primary">{p.name}</span>
                  <button
                    onClick={async () => {
                      await restoreProject(p.id)
                      toast('Project restored')
                    }}
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-accent hover:bg-accent-subtle-bg"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Restore
                  </button>
                  <button
                    onClick={() => permanentlyDeleteProject(p.id)}
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-danger hover:bg-danger-subtle-bg"
                  >
                    <X className="h-3.5 w-3.5" /> Delete forever
                  </button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="notes" className="pt-4">
          {notes.length === 0 ? (
            <EmptyState icon={<Trash2 className="h-6 w-6" />} title="Trash is empty" description="Deleted notes will show up here." />
          ) : (
            <div className="space-y-2">
              {notes.map((n) => (
                <div key={n.id} className="flex items-center gap-2 rounded-lg border border-border-subtle bg-surface px-3 py-2.5">
                  <span className="flex-1 truncate text-sm text-text-primary">{n.title || 'Untitled note'}</span>
                  <button
                    onClick={async () => {
                      await restoreNote(n.id)
                      toast('Note restored')
                    }}
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-accent hover:bg-accent-subtle-bg"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Restore
                  </button>
                  <button
                    onClick={() => permanentlyDeleteNote(n.id)}
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-danger hover:bg-danger-subtle-bg"
                  >
                    <X className="h-3.5 w-3.5" /> Delete forever
                  </button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </TabsRoot>
    </div>
  )
}
