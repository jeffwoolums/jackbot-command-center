'use client'

import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'

interface KanbanTask {
  id: string
  title: string
  status: 'backlog' | 'inprogress' | 'done'
  priority: 'high' | 'medium' | 'low'
  project: 'LessonCraft' | 'JD Gallery' | 'Infrastructure' | 'Content' | 'Other'
  owner: string
  source: 'manual' | 'todo' | 'active_context' | 'subagent'
  createdAt: string
  updatedAt: string
  description?: string
  tags?: string[]
}

interface Column {
  id: string
  title: string
  color: string
}

interface Props {
  className?: string
}

const PROJECT_COLORS = {
  'LessonCraft': 'border-amber-500 bg-amber-500/10 text-amber-400',
  'JD Gallery': 'border-green-500 bg-green-500/10 text-green-400',
  'Infrastructure': 'border-blue-500 bg-blue-500/10 text-blue-400',
  'Content': 'border-purple-500 bg-purple-500/10 text-purple-400',
  'Other': 'border-slate-500 bg-slate-500/10 text-slate-400'
}

const PRIORITY_COLORS = {
  high: 'bg-red-500/20 text-red-400 border-red-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-slate-500/20 text-slate-400 border-slate-500/30'
}

const SOURCE_ICONS = {
  manual: '✋',
  todo: '📝',
  active_context: '🎯',
  subagent: '🤖'
}

export default function EnhancedKanbanBoard({ className = '' }: Props) {
  const [tasks, setTasks] = useState<KanbanTask[]>([])
  const [columns, setColumns] = useState<Column[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newTask, setNewTask] = useState({
    title: '',
    status: 'backlog' as KanbanTask['status'],
    priority: 'medium' as KanbanTask['priority'],
    project: 'Other' as KanbanTask['project'],
    owner: 'Manual',
    description: '',
    tags: [] as string[]
  })

  useEffect(() => {
    fetchKanbanData()
    // Refresh every 30 seconds to pick up new TODO/ACTIVE_CONTEXT changes
    const interval = setInterval(fetchKanbanData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchKanbanData = async () => {
    try {
      const res = await fetch('/api/kanban', { cache: 'no-store' })
      const data = await res.json()
      setTasks(data.tasks || [])
      setColumns(data.columns || [])
    } catch (e) {
      console.error('Failed to fetch kanban data:', e)
    }
    setLoading(false)
  }

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return

    const { draggableId, destination } = result
    const newStatus = destination.droppableId as KanbanTask['status']

    // Optimistic update
    setTasks(prev => prev.map(task => 
      task.id === draggableId ? { ...task, status: newStatus, updatedAt: new Date().toISOString() } : task
    ))

    // Save to server
    try {
      await fetch('/api/kanban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'move',
          taskId: draggableId, 
          newStatus 
        })
      })
    } catch (e) {
      console.error('Failed to move task:', e)
      // Revert on error
      fetchKanbanData()
    }
  }

  const createTask = async () => {
    try {
      const res = await fetch('/api/kanban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'create',
          ...newTask
        })
      })
      const data = await res.json()
      if (data.success) {
        setTasks(data.tasks)
        setShowCreateModal(false)
        setNewTask({
          title: '',
          status: 'backlog',
          priority: 'medium',
          project: 'Other',
          owner: 'Manual',
          description: '',
          tags: []
        })
      }
    } catch (e) {
      console.error('Failed to create task:', e)
    }
  }

  const deleteTask = async (taskId: string) => {
    try {
      const res = await fetch('/api/kanban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'delete',
          id: taskId
        })
      })
      const data = await res.json()
      if (data.success) {
        setTasks(data.tasks)
      }
    } catch (e) {
      console.error('Failed to delete task:', e)
    }
  }

  const getTasksByStatus = (status: string) => 
    tasks.filter(t => t.status === status)

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    
    if (diffHours < 1) return 'just now'
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffHours < 48) return 'yesterday'
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="p-4 bg-slate-900 rounded-lg border border-slate-700 animate-pulse">
              <div className="h-6 bg-slate-700 rounded mb-4"></div>
              <div className="space-y-2">
                <div className="h-16 bg-slate-800 rounded"></div>
                <div className="h-16 bg-slate-800 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">📋 Enhanced Kanban Board</h2>
          <p className="text-slate-400 text-sm">Auto-synced with TODO.md and ACTIVE_CONTEXT.md</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-medium rounded-lg transition-colors"
        >
          + Add Task
        </button>
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {columns.map(column => {
            const columnTasks = getTasksByStatus(column.id)
            
            return (
              <div key={column.id} className={`p-4 bg-slate-900 rounded-lg border-t-4 ${column.color}`}>
                <h3 className="font-bold text-slate-300 mb-4 flex justify-between">
                  {column.title}
                  <span className="text-slate-500 font-normal bg-slate-800 px-2 py-1 rounded-full text-xs">
                    {columnTasks.length}
                  </span>
                </h3>

                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`min-h-[400px] space-y-3 transition-colors rounded-lg p-2 ${
                        snapshot.isDraggingOver ? 'bg-slate-800/50 border border-slate-600 border-dashed' : ''
                      }`}
                    >
                      {columnTasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`p-3 bg-slate-800 rounded-lg border transition-all cursor-grab active:cursor-grabbing ${
                                snapshot.isDragging 
                                  ? 'shadow-xl scale-105 rotate-2 border-amber-500' 
                                  : 'border-slate-700 hover:border-slate-500'
                              } ${PROJECT_COLORS[task.project]?.includes('border-') ? PROJECT_COLORS[task.project] : 'border-slate-700'}`}
                            >
                              {/* Task Header */}
                              <div className="flex justify-between items-start mb-2">
                                <span className="text-xs bg-slate-900 px-2 py-1 rounded text-slate-400">
                                  {SOURCE_ICONS[task.source]} {task.source}
                                </span>
                                {task.source === 'manual' && (
                                  <button
                                    onClick={() => deleteTask(task.id)}
                                    className="px-2 py-1 rounded hover:bg-red-900 text-slate-500 hover:text-red-400 text-xs"
                                  >
                                    Delete
                                  </button>
                                )}
                              </div>

                              {/* Task Title */}
                              <h4 className="text-sm font-medium text-white mb-2 line-clamp-2">
                                {task.title}
                              </h4>

                              {/* Description */}
                              {task.description && (
                                <p className="text-xs text-slate-400 mb-2 line-clamp-2">
                                  {task.description}
                                </p>
                              )}

                              {/* Priority & Project */}
                              <div className="flex items-center justify-between mb-2">
                                <span className={`text-xs px-2 py-0.5 rounded border ${PRIORITY_COLORS[task.priority]}`}>
                                  {task.priority.toUpperCase()}
                                </span>
                                <span className={`text-xs px-2 py-0.5 rounded ${PROJECT_COLORS[task.project]}`}>
                                  {task.project}
                                </span>
                              </div>

                              {/* Footer */}
                              <div className="flex items-center justify-between text-xs text-slate-500">
                                <div className="flex items-center gap-1">
                                  <span>👤</span>
                                  {task.owner}
                                </div>
                                <div className="flex items-center gap-1">
                                  <span>🕒</span>
                                  {formatDate(task.updatedAt)}
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      
                      {/* Empty State */}
                      {columnTasks.length === 0 && (
                        <div className="text-center py-8 text-slate-600">
                          <div className="text-2xl mb-2">📭</div>
                          <div className="text-sm">No tasks here</div>
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            )
          })}
        </div>
      </DragDropContext>

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-lg p-6 w-full max-w-md border border-slate-700">
            <h3 className="text-lg font-bold text-white mb-4">Create New Task</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Title</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  placeholder="Enter task title..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
                  <select
                    value={newTask.status}
                    onChange={(e) => setNewTask(prev => ({ ...prev, status: e.target.value as KanbanTask['status'] }))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="backlog">Backlog</option>
                    <option value="inprogress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value as KanbanTask['priority'] }))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Project</label>
                <select
                  value={newTask.project}
                  onChange={(e) => setNewTask(prev => ({ ...prev, project: e.target.value as KanbanTask['project'] }))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="LessonCraft">LessonCraft</option>
                  <option value="JD Gallery">JD Gallery</option>
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Content">Content</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Description (Optional)</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  rows={3}
                  placeholder="Additional details..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createTask}
                disabled={!newTask.title.trim()}
                className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:hover:bg-amber-500 text-black font-medium rounded-lg transition-colors"
              >
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}