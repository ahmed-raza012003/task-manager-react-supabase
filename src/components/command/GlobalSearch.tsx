import { useMemo, useState } from 'react'
import * as RadixDialog from '@radix-ui/react-dialog'
import { Search, ListTodo, LayoutGrid, StickyNote, Tag } from 'lucide-react'
import { useSearchStore } from '@/stores/commandPaletteStore'
import { useAllTasks } from '@/data/tasks'
import { useProjects } from '@/data/projects'
import { useNotes } from '@/data/notes'
import { useLabels } from '@/data/labels'
import { useUIStore } from '@/stores/uiStore'
import { useDebounce } from '@/hooks/useDebounce'
import { useNavigate } from 'react-router-dom'
import { PriorityDot } from '@/components/common/PriorityDot'

export function GlobalSearch() {
  const isOpen = useSearchStore((s) => s.isOpen)
  const close = useSearchStore((s) => s.close)
  const [query, setQuery] = useState('')
  const debounced = useDebounce(query, 150)

  const tasks = useAllTasks() ?? []
  const projects = useProjects() ?? []
  const notes = useNotes() ?? []
  const labels = useLabels() ?? []
  const openTaskPanel = useUIStore((s) => s.openTaskPanel)
  const navigate = useNavigate()

  const results = useMemo(() => {
    const q = debounced.trim().toLowerCase()
    if (!q) return null
    return {
      tasks: tasks.filter((t) => t.title.toLowerCase().includes(q)).slice(0, 8),
      projects: projects.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 5),
      notes: notes.filter((n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)).slice(0, 5),
      labels: labels.filter((l) => l.name.toLowerCase().includes(q)).slice(0, 5),
    }
  }, [debounced, tasks, projects, notes, labels])

  const totalResults = results ? results.tasks.length + results.projects.length + results.notes.length + results.labels.length : 0

  return (
    <RadixDialog.Root
      open={isOpen}
      onOpenChange={(o) => {
        if (!o) {
          close()
          setQuery('')
        }
      }}
    >
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] data-[state=open]:animate-[fadeIn_150ms_ease-out]" />
        <RadixDialog.Content className="fixed left-1/2 top-[14%] z-50 w-full max-w-xl -translate-x-1/2 overflow-hidden rounded-xl border border-border-subtle bg-surface-raised shadow-token-lg focus:outline-none">
          <RadixDialog.Title className="sr-only">Search</RadixDialog.Title>
          <div className="flex items-center gap-2 border-b border-border-subtle px-4 py-3">
            <Search className="h-4 w-4 text-text-tertiary" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tasks, projects, notes, labels…"
              className="flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-tertiary"
            />
          </div>

          <div className="max-h-96 overflow-y-auto p-2">
            {!results && <p className="py-10 text-center text-sm text-text-tertiary">Start typing to search everything.</p>}
            {results && totalResults === 0 && <p className="py-10 text-center text-sm text-text-tertiary">No results for "{debounced}"</p>}

            {results && results.tasks.length > 0 && (
              <ResultGroup label="Tasks" icon={<ListTodo className="h-3.5 w-3.5" />}>
                {results.tasks.map((t) => (
                  <ResultRow
                    key={t.id}
                    onClick={() => {
                      openTaskPanel(t.id)
                      close()
                    }}
                  >
                    <PriorityDot priority={t.priority} />
                    <span className="truncate">{t.title}</span>
                  </ResultRow>
                ))}
              </ResultGroup>
            )}

            {results && results.projects.length > 0 && (
              <ResultGroup label="Projects" icon={<LayoutGrid className="h-3.5 w-3.5" />}>
                {results.projects.map((p) => (
                  <ResultRow
                    key={p.id}
                    onClick={() => {
                      navigate(`/projects/${p.id}`)
                      close()
                    }}
                  >
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
                    {p.name}
                  </ResultRow>
                ))}
              </ResultGroup>
            )}

            {results && results.notes.length > 0 && (
              <ResultGroup label="Notes" icon={<StickyNote className="h-3.5 w-3.5" />}>
                {results.notes.map((n) => (
                  <ResultRow
                    key={n.id}
                    onClick={() => {
                      navigate('/notes')
                      close()
                    }}
                  >
                    {n.title || 'Untitled note'}
                  </ResultRow>
                ))}
              </ResultGroup>
            )}

            {results && results.labels.length > 0 && (
              <ResultGroup label="Labels" icon={<Tag className="h-3.5 w-3.5" />}>
                {results.labels.map((l) => (
                  <ResultRow
                    key={l.id}
                    onClick={() => {
                      navigate('/labels')
                      close()
                    }}
                  >
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: l.color }} />
                    {l.name}
                  </ResultRow>
                ))}
              </ResultGroup>
            )}
          </div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  )
}

function ResultGroup({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mb-1">
      <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">
        {icon} {label}
      </div>
      {children}
    </div>
  )
}

function ResultRow({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm text-text-primary hover:bg-hover">
      {children}
    </button>
  )
}
