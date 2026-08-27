import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { KanbanCard } from './KanbanCard'
import type { Task } from '@/data/types'

export function SortableKanbanCard({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: 'task', task },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <KanbanCard
      ref={setNodeRef}
      style={style}
      dragging={isDragging}
      task={task}
      {...attributes}
      {...listeners}
    />
  )
}
