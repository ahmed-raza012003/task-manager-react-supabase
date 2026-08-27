import { useMemo, useState } from 'react'
import { LayoutGrid } from 'lucide-react'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { EmptyState } from '@/components/common/EmptyState'
import { Button } from '@/components/common/Button'
import { useProjects } from '@/data/projects'
import { useProjectDialogStore } from '@/stores/projectDialogStore'
import { cn } from '@/lib/cn'
import type { ProjectStatus } from '@/data/types'

const FILTERS: { value: ProjectStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'planning', label: 'Planning' },
  { value: 'on_hold', label: 'On hold' },
  { value: 'completed', label: 'Completed' },
]

export default function ProjectsPage() {
  const projects = useProjects() ?? []
  const openProjectDialog = useProjectDialogStore((s) => s.open)
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all')

  const filtered = useMemo(
    () => (statusFilter === 'all' ? projects : projects.filter((p) => p.status === statusFilter)),
    [projects, statusFilter],
  )

  return (
    <div className="mx-auto max-w-6xl space-y-5 px-4 py-6 md:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-text-primary">Projects</h1>
          <p className="mt-1 text-sm text-text-secondary">{projects.length} project{projects.length === 1 ? '' : 's'}</p>
        </div>
        <Button variant="primary" onClick={() => openProjectDialog()}>
          + New project
        </Button>
      </div>

      <div className="flex gap-1 rounded-lg bg-inset p-1 w-fit">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={cn(
              'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
              statusFilter === f.value ? 'bg-surface text-text-primary shadow-token-sm' : 'text-text-secondary hover:text-text-primary',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<LayoutGrid className="h-6 w-6" />}
          title="No projects yet"
          description="Create your first project to start organizing tasks into a board."
          action={
            <button onClick={() => openProjectDialog()} className="text-sm font-medium text-accent hover:underline">
              + Create a project
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}
    </div>
  )
}
