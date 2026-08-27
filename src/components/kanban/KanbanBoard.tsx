import { useMemo, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import { SortableContext, horizontalListSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { LayoutGrid, Plus } from 'lucide-react'
import { KanbanColumn } from './KanbanColumn'
import { KanbanCard } from './KanbanCard'
import { Input } from '@/components/common/Input'
import { useKanbanColumns, createColumn, reorderColumn } from '@/data/kanbanColumns'
import { useProjectTasks, moveTaskToColumn, reorderTask } from '@/data/tasks'
import { EmptyState } from '@/components/common/EmptyState'
import type { Task } from '@/data/types'

export function KanbanBoard({ projectId }: { projectId: string }) {
  const columns = useKanbanColumns(projectId) ?? []
  const tasks = useProjectTasks(projectId) ?? []
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [addingColumn, setAddingColumn] = useState(false)
  const [newColumnName, setNewColumnName] = useState('')

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const tasksByColumn = useMemo(() => {
    const map = new Map<string, Task[]>()
    for (const col of columns) map.set(col.id, [])
    for (const task of tasks) {
      if (task.columnId && map.has(task.columnId)) map.get(task.columnId)!.push(task)
    }
    for (const [, list] of map) list.sort((a, b) => a.sortOrder - b.sortOrder)
    return map
  }, [columns, tasks])

  function handleDragStart(event: DragStartEvent) {
    if (event.active.data.current?.type === 'task') {
      setActiveTask(event.active.data.current.task as Task)
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveTask(null)
    if (!over || active.id === over.id) return

    const activeType = active.data.current?.type

    if (activeType === 'column') {
      const oldIndex = columns.findIndex((c) => c.id === active.id)
      const overIndex = columns.findIndex((c) => c.id === over.id)
      if (oldIndex === -1 || overIndex === -1) return
      const before = columns[overIndex - (overIndex > oldIndex ? 0 : 1)]
      const after = columns[overIndex + (overIndex > oldIndex ? 1 : 0)]
      await reorderColumn(active.id as string, before?.sortOrder, after?.sortOrder)
      return
    }

    if (activeType === 'task') {
      const activeTaskData = active.data.current?.task as Task
      const overType = over.data.current?.type
      let targetColumnId: string | null = null
      let overTaskList: Task[] = []
      let overIndex = -1

      if (overType === 'task') {
        const overTask = over.data.current?.task as Task
        targetColumnId = overTask.columnId
        overTaskList = tasksByColumn.get(targetColumnId ?? '') ?? []
        overIndex = overTaskList.findIndex((t) => t.id === overTask.id)
      } else if (overType === 'column') {
        targetColumnId = over.data.current?.columnId as string
        overTaskList = tasksByColumn.get(targetColumnId ?? '') ?? []
        overIndex = overTaskList.length
      } else {
        return
      }

      if (targetColumnId === activeTaskData.columnId) {
        const sameList = overTaskList.filter((t) => t.id !== activeTaskData.id)
        const before = sameList[overIndex - 1]
        const after = sameList[overIndex]
        await reorderTask(activeTaskData.id, before?.sortOrder, after?.sortOrder)
      } else {
        const before = overTaskList[overIndex - 1]
        const after = overTaskList[overIndex]
        await moveTaskToColumn(activeTaskData.id, targetColumnId, before?.sortOrder, after?.sortOrder)
      }
    }
  }

  if (columns.length === 0) {
    return (
      <EmptyState
        icon={<LayoutGrid className="h-6 w-6" />}
        title="No columns yet"
        description="This board has no columns. Add one to start organizing tasks."
      />
    )
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex h-full gap-3 overflow-x-auto pb-2">
        <SortableContext items={columns.map((c) => c.id)} strategy={horizontalListSortingStrategy}>
          {columns.map((col) => (
            <KanbanColumn key={col.id} column={col} tasks={tasksByColumn.get(col.id) ?? []} projectId={projectId} />
          ))}
        </SortableContext>

        <div className="w-64 shrink-0">
          {addingColumn ? (
            <Input
              autoFocus
              placeholder="Column name…"
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
              onKeyDown={async (e) => {
                if (e.key === 'Enter' && newColumnName.trim()) {
                  await createColumn(projectId, newColumnName.trim())
                  setNewColumnName('')
                  setAddingColumn(false)
                }
                if (e.key === 'Escape') setAddingColumn(false)
              }}
              onBlur={() => setAddingColumn(false)}
              className="h-9"
            />
          ) : (
            <button
              onClick={() => setAddingColumn(true)}
              className="flex h-9 w-full items-center gap-1.5 rounded-lg border border-dashed border-border-strong px-3 text-sm font-medium text-text-tertiary hover:bg-hover hover:text-text-primary"
            >
              <Plus className="h-4 w-4" /> Add column
            </button>
          )}
        </div>
      </div>

      <DragOverlay>{activeTask && <KanbanCard task={activeTask} dragging className="w-72" />}</DragOverlay>
    </DndContext>
  )
}
