import { useMemo, useState } from 'react'
import { Plus, StickyNote } from 'lucide-react'
import { NoteCard } from '@/components/notes/NoteCard'
import { NoteEditor } from '@/components/notes/NoteEditor'
import { EmptyState } from '@/components/common/EmptyState'
import { Input } from '@/components/common/Input'
import { Button } from '@/components/common/Button'
import { useNotes, createNote } from '@/data/notes'
import { useDebounce } from '@/hooks/useDebounce'

export default function NotesPage() {
  const notes = useNotes() ?? []
  const [query, setQuery] = useState('')
  const debounced = useDebounce(query, 150)
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = debounced.trim().toLowerCase()
    if (!q) return notes
    return notes.filter((n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q))
  }, [notes, debounced])

  return (
    <div className="mx-auto max-w-6xl space-y-5 px-4 py-6 md:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-text-primary">Notes</h1>
          <p className="mt-1 text-sm text-text-secondary">{notes.length} note{notes.length === 1 ? '' : 's'}</p>
        </div>
        <Button
          variant="primary"
          onClick={async () => {
            const note = await createNote({ title: 'Untitled note' })
            setEditingNoteId(note.id)
          }}
        >
          <Plus className="h-4 w-4" /> New note
        </Button>
      </div>

      <Input placeholder="Search notes…" value={query} onChange={(e) => setQuery(e.target.value)} className="max-w-sm" />

      {filtered.length === 0 ? (
        <EmptyState
          icon={<StickyNote className="h-6 w-6" />}
          title={notes.length === 0 ? 'No notes yet' : 'No notes found'}
          description={notes.length === 0 ? 'Capture ideas, meeting notes, or anything else on your mind.' : 'Try a different search term.'}
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((n) => (
            <NoteCard key={n.id} note={n} onOpen={() => setEditingNoteId(n.id)} />
          ))}
        </div>
      )}

      <NoteEditor noteId={editingNoteId} onClose={() => setEditingNoteId(null)} />
    </div>
  )
}
