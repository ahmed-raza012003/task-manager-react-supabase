import { useEffect, useState } from 'react'
import { Dialog } from '@/components/common/Dialog'
import { Textarea } from '@/components/common/Input'
import { LabelPicker } from '@/components/labels/LabelPicker'
import { LabelBadge } from '@/components/labels/LabelBadge'
import { useNote, updateNote } from '@/data/notes'
import { useProjects } from '@/data/projects'
import { useLabels } from '@/data/labels'

export function NoteEditor({ noteId, onClose }: { noteId: string | null; onClose: () => void }) {
  const note = useNote(noteId)
  const projects = useProjects() ?? []
  const allLabels = useLabels() ?? []

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  useEffect(() => {
    setTitle(note?.title ?? '')
    setContent(note?.content ?? '')
  }, [note?.id, note?.title, note?.content])

  if (!noteId) return null

  return (
    <Dialog open={!!noteId} onOpenChange={(o) => !o && onClose()} className="max-w-xl">
      <div className="p-5">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => note && title.trim() && updateNote(note.id, { title: title.trim() })}
          placeholder="Note title"
          className="w-full bg-transparent font-display text-lg font-semibold text-text-primary outline-none placeholder:text-text-tertiary"
        />

        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-text-secondary">
          {note?.projectId && (
            <select
              value={note.projectId}
              onChange={(e) => note && updateNote(note.id, { projectId: e.target.value || null })}
              className="h-7 rounded-md border border-border-subtle bg-surface px-1.5 text-xs outline-none"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          )}
          <div className="flex flex-wrap items-center gap-1.5">
            {allLabels
              .filter((l) => note?.labelIds.includes(l.id))
              .map((l) => (
                <LabelBadge
                  key={l.id}
                  label={l}
                  onRemove={() => note && updateNote(note.id, { labelIds: note.labelIds.filter((id) => id !== l.id) })}
                />
              ))}
            <LabelPicker
              selectedIds={note?.labelIds ?? []}
              onToggle={(id) =>
                note &&
                updateNote(note.id, {
                  labelIds: note.labelIds.includes(id) ? note.labelIds.filter((x) => x !== id) : [...note.labelIds, id],
                })
              }
            />
          </div>
        </div>

        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onBlur={() => note && updateNote(note.id, { content })}
          placeholder="Start writing…"
          rows={10}
          className="mt-4 border-none px-0 focus-visible:shadow-none"
        />
      </div>
    </Dialog>
  )
}
