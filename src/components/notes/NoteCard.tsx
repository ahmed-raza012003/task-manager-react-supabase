import { Pin, Archive, Trash2, MoreHorizontal } from 'lucide-react'
import {
  DropdownMenuRoot,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/common/DropdownMenu'
import { togglePinNote, archiveNote, trashNote } from '@/data/notes'
import { useProject } from '@/data/projects'
import { useLabels } from '@/data/labels'
import { LabelBadge } from '@/components/labels/LabelBadge'
import { friendlyDateLabel } from '@/lib/dateHelpers'
import { toast } from '@/stores/toastStore'
import { cn } from '@/lib/cn'
import type { Note } from '@/data/types'

export function NoteCard({ note, onOpen }: { note: Note; onOpen: () => void }) {
  const project = useProject(note.projectId)
  const allLabels = useLabels() ?? []
  const noteLabels = allLabels.filter((l) => note.labelIds.includes(l.id))

  return (
    <div
      onClick={onOpen}
      className="group flex cursor-pointer flex-col rounded-xl border border-border-subtle bg-surface p-4 transition-all hover:-translate-y-0.5 hover:border-border-strong hover:shadow-token-md"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="min-w-0 flex-1 truncate font-display text-sm font-semibold text-text-primary">{note.title || 'Untitled note'}</h3>
        <div className="flex shrink-0 items-center gap-0.5">
          <button
            onClick={(e) => {
              e.stopPropagation()
              togglePinNote(note.id, !note.pinned)
            }}
            className={cn('rounded p-1', note.pinned ? 'text-accent' : 'text-text-tertiary opacity-0 group-hover:opacity-100 hover:text-text-primary')}
          >
            <Pin className="h-3.5 w-3.5" fill={note.pinned ? 'currentColor' : 'none'} />
          </button>
          <DropdownMenuRoot>
            <DropdownMenuTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className="rounded p-1 text-text-tertiary opacity-0 hover:text-text-primary group-hover:opacity-100"
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={async () => { await archiveNote(note.id, true); toast('Note archived') }}>
                <Archive className="h-3.5 w-3.5" /> Archive
              </DropdownMenuItem>
              <DropdownMenuItem danger onSelect={async () => { await trashNote(note.id); toast('Note moved to trash') }}>
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenuRoot>
        </div>
      </div>

      <p className="mt-1.5 line-clamp-4 whitespace-pre-wrap text-xs text-text-secondary">{note.content || 'No content yet…'}</p>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {project && (
          <span className="flex items-center gap-1 text-[11px] text-text-tertiary">
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: project.color }} />
            {project.name}
          </span>
        )}
        {noteLabels.map((l) => (
          <LabelBadge key={l.id} label={l} />
        ))}
      </div>
      <p className="mt-2 text-[11px] text-text-tertiary">Updated {friendlyDateLabel(note.updatedAt.slice(0, 10))}</p>
    </div>
  )
}
