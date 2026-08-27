import { useNavigate } from 'react-router-dom'
import * as Icons from 'lucide-react'
import { MoreHorizontal, Archive, Trash2, Pencil } from 'lucide-react'
import { ProgressBar } from '@/components/common/ProgressBar'
import { Badge } from '@/components/common/Badge'
import { PriorityDot } from '@/components/common/PriorityDot'
import {
  DropdownMenuRoot,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/common/DropdownMenu'
import { useProjectStats, archiveProject, trashProject } from '@/data/projects'
import { useProjectDialogStore } from '@/stores/projectDialogStore'
import { friendlyDateLabel } from '@/lib/dateHelpers'
import { priorityLabel } from '@/lib/colors'
import { toast } from '@/stores/toastStore'
import type { Project } from '@/data/types'
import type { LucideIcon } from 'lucide-react'

const STATUS_TONE: Record<Project['status'], 'neutral' | 'accent' | 'warning' | 'success'> = {
  planning: 'neutral',
  active: 'accent',
  on_hold: 'warning',
  completed: 'success',
}

const STATUS_LABEL: Record<Project['status'], string> = {
  planning: 'Planning',
  active: 'Active',
  on_hold: 'On hold',
  completed: 'Completed',
}

export function ProjectCard({ project }: { project: Project }) {
  const stats = useProjectStats(project.id)
  const navigate = useNavigate()
  const openProjectDialog = useProjectDialogStore((s) => s.open)
  const Icon = (Icons[project.icon as keyof typeof Icons] as LucideIcon) ?? Icons.Rocket

  return (
    <div
      onClick={() => navigate(`/projects/${project.id}`)}
      className="group cursor-pointer rounded-xl border border-border-subtle bg-surface p-4 transition-all hover:-translate-y-0.5 hover:border-border-strong hover:shadow-token-md"
    >
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: `${project.color}1A`, color: project.color }}>
          <Icon className="h-5 w-5" />
        </div>
        <DropdownMenuRoot>
          <DropdownMenuTrigger asChild>
            <button
              onClick={(e) => e.stopPropagation()}
              className="rounded-md p-1 text-text-tertiary opacity-0 hover:bg-hover hover:text-text-primary group-hover:opacity-100"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => openProjectDialog(project.id)}>
              <Pencil className="h-3.5 w-3.5" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={async () => { await archiveProject(project.id, true); toast('Project archived') }}>
              <Archive className="h-3.5 w-3.5" /> Archive
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem danger onSelect={async () => { await trashProject(project.id); toast('Project moved to trash') }}>
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenuRoot>
      </div>

      <h3 className="mt-3 truncate font-display text-[15px] font-semibold text-text-primary">{project.name}</h3>
      {project.description && <p className="mt-0.5 line-clamp-2 text-xs text-text-secondary">{project.description}</p>}

      <div className="mt-3.5">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="font-medium text-text-secondary">Progress</span>
          <span className="font-semibold text-text-primary">{stats.progress}%</span>
        </div>
        <ProgressBar value={stats.progress} />
        <p className="mt-1.5 text-xs text-text-tertiary">
          {stats.completed} / {stats.total} tasks completed
        </p>
      </div>

      <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
        <Badge tone={STATUS_TONE[project.status]}>{STATUS_LABEL[project.status]}</Badge>
        {project.dueDate && <Badge>Due {friendlyDateLabel(project.dueDate)}</Badge>}
        {project.priority && (
          <Badge tone="danger">
            <PriorityDot priority={project.priority} /> {priorityLabel(project.priority)}
          </Badge>
        )}
        {stats.highPriority > 0 && <Badge tone="warning">{stats.highPriority} high priority</Badge>}
      </div>
    </div>
  )
}
