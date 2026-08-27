import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useDroppable } from '@dnd-kit/core'
import { GripVertical, MoreHorizontal, Plus } from 'lucide-react'
import { Input } from '@/components/common/Input'
import {
  DropdownMenuRoot,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from '@/components/common/DropdownMenu'
import { renameColumn, deleteColumn, setColumnTreatAsDone } from '@/data/kanbanColumns'
import { createTask } from '@/data/tasks'
import { SortableKanbanCard } from './SortableKanbanCard'
import { cn } from '@/lib/cn'
import type { KanbanColumn as KanbanColumnType, Task } from '@/data/types'

export function KanbanColumn({ column, tasks, projectId }: { column: KanbanColumnType; tasks: Task[]; projectId: string }) {
  const [renaming, setRenaming] = useState(false)
  const [name, setName] = useState(column.name)
  const [addingTask, setAddingTask] = useState(false)
  const [newTitle, setNewTitle] = useState('')

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: column.id,
    data: { type: 'column' },
  })
  const { setNodeRef: setDropRef } = useDroppable({ id: `column-drop-${column.id}`, data: { type: 'column', columnId: column.id } })

  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }

  const commitRename = async () => {
    if (name.trim() && name.trim() !== column.name) await renameColumn(column.id, name.trim())
    setRenaming(false)
  }

  const submitNewTask = async () => {
    if (newTitle.trim()) {
      await createTask({ title: newTitle.trim(), projectId, columnId: column.id, status: column.treatAsDone ? 'done' : 'todo' })
    }
    setNewTitle('')
    setAddingTask(false)
  }

  return (
    <div ref={setNodeRef} style={style} className="flex h-full w-72 shrink-0 flex-col rounded-xl bg-inset/60">
      <div className="flex items-center gap-1.5 px-2.5 pb-2 pt-2.5">
        <button {...attributes} {...listeners} className="cursor-grab text-text-tertiary hover:text-text-primary active:cursor-grabbing">
          <GripVertical className="h-3.5 w-3.5" />
        </button>
        {renaming ? (
          <Input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => e.key === 'Enter' && commitRename()}
            className="h-7 flex-1 px-2 text-sm"
          />
        ) : (
          <button className="flex-1 truncate text-left text-sm font-semibold text-text-primary" onDoubleClick={() => setRenaming(true)}>
            {column.name}
          </button>
        )}
        <span className="rounded-full bg-surface px-1.5 py-0.5 text-[11px] font-medium text-text-tertiary">{tasks.length}</span>
        <DropdownMenuRoot>
          <DropdownMenuTrigger asChild>
            <button className="rounded p-1 text-text-tertiary hover:bg-hover hover:text-text-primary">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => setRenaming(true)}>Rename</DropdownMenuItem>
            <DropdownMenuCheckboxItem checked={column.treatAsDone} onCheckedChange={(v) => setColumnTreatAsDone(column.id, v)}>
              Treat as "Done"
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem danger onSelect={() => deleteColumn(column.id)}>
              Delete column
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenuRoot>
      </div>

      <div ref={setDropRef} className={cn('flex-1 space-y-2 overflow-y-auto px-2.5 pb-2')}>
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableKanbanCard key={task.id} task={task} />
          ))}
        </SortableContext>

        {addingTask ? (
          <div className="rounded-lg border border-border-strong bg-surface p-2">
            <Input
              autoFocus
              placeholder="Task title…"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submitNewTask()
                if (e.key === 'Escape') setAddingTask(false)
              }}
              onBlur={() => (newTitle.trim() ? submitNewTask() : setAddingTask(false))}
              className="h-8 text-sm"
            />
          </div>
        ) : (
          <button
            onClick={() => setAddingTask(true)}
            className="flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-text-tertiary hover:bg-hover hover:text-text-primary"
          >
            <Plus className="h-3.5 w-3.5" /> Add task
          </button>
        )}
      </div>
    </div>
  )
}
