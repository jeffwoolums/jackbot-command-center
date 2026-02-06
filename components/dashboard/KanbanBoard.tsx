'use client'

import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'

interface Task {
  id: string
  title: string
  project: string
  status: string
  priority: string
  owner: string
}

interface Props {
  initialTasks: Task[]
  onTaskMove?: (taskId: string, newStatus: string) => void
}

const columns = [
  { id: 'backlog', title: 'Backlog', color: 'border-slate-600' },
  { id: 'inprogress', title: 'In Progress', color: 'border-amber-500' },
  { id: 'blocked', title: 'Blocked', color: 'border-red-500' },
  { id: 'done', title: 'Done', color: 'border-green-500' }
]

const priorityBadge: Record<string, string> = {
  high: 'bg-red-500/20 text-red-400',
  medium: 'bg-yellow-500/20 text-yellow-400',
  low: 'bg-slate-500/20 text-slate-400'
}

export default function KanbanBoard({ initialTasks, onTaskMove }: Props) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    setTasks(initialTasks)
  }, [initialTasks])

  const getTasksByStatus = (status: string) => 
    tasks.filter(t => t.status === status)

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const { draggableId, destination } = result
    const newStatus = destination.droppableId

    setTasks(prev => prev.map(task => 
      task.id === draggableId ? { ...task, status: newStatus } : task
    ))

    onTaskMove?.(draggableId, newStatus)
  }

  if (!mounted) {
    return (
      <div className="grid grid-cols-4 gap-4">
        {columns.map(col => (
          <div key={col.id} className={`p-3 bg-slate-900 rounded-lg border-t-4 ${col.color}`}>
            <h3 className="font-bold text-slate-300 mb-3 flex justify-between">
              {col.title}
              <span className="text-slate-500">-</span>
            </h3>
            <div className="min-h-[200px] text-slate-600 text-sm">Loading...</div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-4 gap-4">
        {columns.map(column => (
          <div 
            key={column.id} 
            className={`p-3 bg-slate-900 rounded-lg border-t-4 ${column.color}`}
          >
            <h3 className="font-bold text-slate-300 mb-3 flex justify-between">
              {column.title}
              <span className="text-slate-500 font-normal">
                {getTasksByStatus(column.id).length}
              </span>
            </h3>
            <Droppable droppableId={column.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`min-h-[200px] space-y-2 transition-colors rounded ${
                    snapshot.isDraggingOver ? 'bg-slate-800/50' : ''
                  }`}
                >
                  {getTasksByStatus(column.id).map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`p-3 bg-slate-800 rounded border border-slate-700 cursor-grab active:cursor-grabbing transition-all ${
                            snapshot.isDragging ? 'shadow-lg scale-105 rotate-1' : 'hover:border-slate-500'
                          }`}
                        >
                          <div className="text-sm text-white mb-2">{task.title}</div>
                          <div className="flex justify-between items-center">
                            <span className={`text-xs px-2 py-0.5 rounded ${priorityBadge[task.priority]}`}>
                              {task.priority}
                            </span>
                            <span className="text-xs text-slate-500">{task.owner}</span>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  )
}
