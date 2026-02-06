'use client'

import { useState, useEffect } from 'react'

interface Project {
  id: string
  name: string
  status: 'active' | 'blocked' | 'complete'
  progress: number
  nextAction: string
  owner: string
  description: string
  priority: string
}

interface Task {
  id: string
  title: string
  project: string
  status: string
  priority: string
  owner: string
}

interface FeatureRequest {
  id: string
  project: string
  title: string
  description: string
  priority: 'P1' | 'P2' | 'P3' | 'P4'
  requester: string
  status: 'pending' | 'approved' | 'rejected' | 'converted'
  createdAt: string
}

interface Props {
  project: Project | null
  isOpen: boolean
  onClose: () => void
  onTaskMove: (taskId: string, newStatus: string) => void
}

const statusColors = {
  backlog: 'bg-slate-500',
  inprogress: 'bg-blue-500',
  blocked: 'bg-red-500',
  done: 'bg-green-500'
}

const statusLabels = {
  backlog: 'Backlog',
  inprogress: 'In Progress',
  blocked: 'Blocked',
  done: 'Done'
}

const priorityColors = {
  P1: 'text-red-400',
  P2: 'text-amber-400',
  P3: 'text-yellow-400',
  P4: 'text-slate-400'
}

export default function ProjectDetailModal({ project, isOpen, onClose, onTaskMove }: Props) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [featureRequests, setFeatureRequests] = useState<FeatureRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [newFeatureRequest, setNewFeatureRequest] = useState({
    title: '',
    description: '',
    priority: 'P3' as FeatureRequest['priority'],
    requester: 'Jeff'
  })

  useEffect(() => {
    if (project && isOpen) {
      fetchProjectData()
    }
  }, [project, isOpen])

  const fetchProjectData = async () => {
    if (!project) return
    
    try {
      // Fetch tasks for this project
      const tasksRes = await fetch('/api/projects')
      const tasksData = await tasksRes.json()
      const projectTasks = tasksData.tasks.filter((task: Task) => task.project === project.id)
      setTasks(projectTasks)

      // Fetch feature requests for this project
      const featuresRes = await fetch('/api/feature-requests')
      const featuresData = await featuresRes.json()
      const projectFeatures = featuresData.featureRequests.filter((fr: FeatureRequest) => fr.project === project.id)
      setFeatureRequests(projectFeatures)
    } catch (e) {
      console.error('Failed to fetch project data:', e)
    }
    setLoading(false)
  }

  const handleAddFeatureRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!project || !newFeatureRequest.title.trim()) return

    try {
      await fetch('/api/feature-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newFeatureRequest,
          project: project.id,
          status: 'pending'
        })
      })

      setNewFeatureRequest({
        title: '',
        description: '',
        priority: 'P3',
        requester: 'Jeff'
      })
      
      fetchProjectData()
    } catch (e) {
      console.error('Failed to add feature request:', e)
    }
  }

  const convertToTask = async (featureId: string) => {
    try {
      await fetch('/api/feature-requests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: featureId, 
          status: 'converted',
          convertToTask: true 
        })
      })
      fetchProjectData()
    } catch (e) {
      console.error('Failed to convert feature to task:', e)
    }
  }

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId)
  }

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault()
    const taskId = e.dataTransfer.getData('taskId')
    if (taskId) {
      onTaskMove(taskId, newStatus)
      // Update local state
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ))
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  if (!isOpen || !project) return null

  const columns = [
    { id: 'backlog', title: 'Backlog' },
    { id: 'inprogress', title: 'In Progress' },
    { id: 'blocked', title: 'Blocked' },
    { id: 'done', title: 'Done' }
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 rounded-lg border border-slate-700 w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-700">
          <div>
            <h2 className="text-2xl font-bold text-white">{project.name}</h2>
            <p className="text-slate-400 mt-1">{project.description}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="p-6 space-y-8">
            {/* Project Info */}
            <div className="grid grid-cols-3 gap-6">
              <div className="p-4 bg-slate-800 rounded-lg">
                <div className="text-slate-400 text-sm mb-1">Progress</div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${
                        project.progress === 100 
                          ? 'bg-green-500' 
                          : project.progress >= 75 
                          ? 'bg-amber-500' 
                          : project.progress >= 50 
                          ? 'bg-yellow-500' 
                          : 'bg-orange-500'
                      }`}
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                  <span className="text-lg font-bold text-amber-400">{project.progress}%</span>
                </div>
              </div>

              <div className="p-4 bg-slate-800 rounded-lg">
                <div className="text-slate-400 text-sm mb-1">Owner</div>
                <div className="text-lg font-bold text-white">{project.owner}</div>
              </div>

              <div className="p-4 bg-slate-800 rounded-lg">
                <div className="text-slate-400 text-sm mb-1">Next Action</div>
                <div className="text-lg font-bold text-white">{project.nextAction}</div>
              </div>
            </div>

            {/* Kanban Board */}
            <div>
              <h3 className="text-lg font-bold text-amber-400 mb-4">📋 Project Kanban Board</h3>
              {loading ? (
                <div className="text-center py-8 text-slate-500">Loading tasks...</div>
              ) : (
                <div className="grid grid-cols-4 gap-4">
                  {columns.map((column) => (
                    <div
                      key={column.id}
                      className="bg-slate-800 rounded-lg p-4 min-h-[400px]"
                      onDrop={(e) => handleDrop(e, column.id)}
                      onDragOver={handleDragOver}
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-white">{column.title}</h4>
                        <span className={`${statusColors[column.id as keyof typeof statusColors]} text-xs px-2 py-0.5 rounded-full text-black font-medium`}>
                          {tasks.filter(t => t.status === column.id).length}
                        </span>
                      </div>
                      <div className="space-y-3">
                        {tasks
                          .filter(task => task.status === column.id)
                          .map((task) => (
                            <div
                              key={task.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, task.id)}
                              className="p-3 bg-slate-900 rounded-lg border border-slate-700 cursor-move hover:border-slate-600 transition-colors"
                            >
                              <div className="font-medium text-white mb-1">{task.title}</div>
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400">{task.owner}</span>
                                <span className={`${priorityColors[task.priority as keyof typeof priorityColors] || 'text-slate-400'}`}>
                                  {task.priority}
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Feature Requests */}
            <div>
              <h3 className="text-lg font-bold text-amber-400 mb-4">💡 Feature Requests</h3>
              
              {/* Add Feature Request Form */}
              <div className="mb-6 p-4 bg-slate-800 rounded-lg">
                <h4 className="font-bold text-white mb-3">Add New Feature Request</h4>
                <form onSubmit={handleAddFeatureRequest} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={newFeatureRequest.title}
                      onChange={(e) => setNewFeatureRequest({...newFeatureRequest, title: e.target.value})}
                      placeholder="Feature title"
                      className="bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      required
                    />
                    <select
                      value={newFeatureRequest.priority}
                      onChange={(e) => setNewFeatureRequest({...newFeatureRequest, priority: e.target.value as FeatureRequest['priority']})}
                      className="bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="P1">P1 - Critical</option>
                      <option value="P2">P2 - High</option>
                      <option value="P3">P3 - Medium</option>
                      <option value="P4">P4 - Low</option>
                    </select>
                  </div>
                  <textarea
                    value={newFeatureRequest.description}
                    onChange={(e) => setNewFeatureRequest({...newFeatureRequest, description: e.target.value})}
                    placeholder="Description and details..."
                    rows={2}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                  <div className="flex justify-between items-center">
                    <select
                      value={newFeatureRequest.requester}
                      onChange={(e) => setNewFeatureRequest({...newFeatureRequest, requester: e.target.value})}
                      className="bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="Jeff">Jeff</option>
                      <option value="Robert">Robert</option>
                      <option value="Bryce">Bryce</option>
                      <option value="Isaac">Isaac</option>
                    </select>
                    <button
                      type="submit"
                      className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-4 py-2 rounded transition-colors"
                    >
                      Add Feature Request
                    </button>
                  </div>
                </form>
              </div>

              {/* Feature Requests List */}
              {loading ? (
                <div className="text-center py-4 text-slate-500">Loading feature requests...</div>
              ) : featureRequests.length === 0 ? (
                <div className="text-center py-8 text-slate-500">No feature requests yet</div>
              ) : (
                <div className="space-y-3">
                  {featureRequests.map((feature) => (
                    <div
                      key={feature.id}
                      className="p-4 bg-slate-800 rounded-lg border border-slate-700"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold text-white">{feature.title}</h4>
                          <p className="text-slate-400 text-sm mt-1">{feature.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`${priorityColors[feature.priority]} text-xs font-medium`}>
                            {feature.priority}
                          </span>
                          <span className="text-xs text-slate-500">
                            {new Date(feature.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-slate-400">
                          Requested by: <span className="text-slate-300">{feature.requester}</span>
                        </div>
                        {feature.status === 'pending' && (
                          <button
                            onClick={() => convertToTask(feature.id)}
                            className="text-xs bg-green-500 hover:bg-green-400 text-black px-3 py-1 rounded transition-colors"
                          >
                            Convert to Task
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}