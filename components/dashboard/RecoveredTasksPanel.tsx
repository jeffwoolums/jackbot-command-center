'use client'

import { useState, useEffect } from 'react'

interface RecoveredTask {
  id: string
  title: string
  description: string
  project: string
  priority: 'P1' | 'P2' | 'P3' | 'P4'
  status: 'pending' | 'inprogress' | 'done'
  recoveredFrom: string
  recoveredAt: string
}

const priorityColors = {
  P1: 'bg-red-500/20 text-red-400 border-red-500/30',
  P2: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  P3: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  P4: 'bg-slate-500/20 text-slate-400 border-slate-500/30'
}

const statusColors = {
  pending: 'bg-slate-500',
  inprogress: 'bg-blue-500',
  done: 'bg-green-500'
}

const statusLabels = {
  pending: 'Pending',
  inprogress: 'In Progress',
  done: 'Done'
}

export default function RecoveredTasksPanel() {
  const [tasks, setTasks] = useState<RecoveredTask[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecoveredTasks()
  }, [])

  const fetchRecoveredTasks = async () => {
    try {
      const res = await fetch('/api/recovered-tasks', { cache: 'no-store' })
      const data = await res.json()
      setTasks(data.recoveredTasks || [])
    } catch (e) {
      console.error('Failed to fetch recovered tasks:', e)
    }
    setLoading(false)
  }

  const updateStatus = async (id: string, newStatus: RecoveredTask['status']) => {
    try {
      await fetch('/api/recovered-tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      })
      fetchRecoveredTasks()
    } catch (e) {
      console.error('Failed to update task:', e)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="p-4 bg-slate-900 rounded-lg border border-amber-500/30">
        <h2 className="text-lg font-bold text-amber-400 mb-4">🔍 Recovered Tasks</h2>
        <div className="text-center py-8 text-slate-500">Loading recovered tasks...</div>
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="p-4 bg-slate-900 rounded-lg border border-amber-500/30">
        <h2 className="text-lg font-bold text-amber-400 mb-4">🔍 Recovered Tasks</h2>
        <div className="text-center py-8 text-slate-500">No recovered tasks found</div>
      </div>
    )
  }

  return (
    <div className="p-4 bg-slate-900 rounded-lg border border-amber-500/30">
      <h2 className="text-lg font-bold text-amber-400 mb-4">🔍 Recovered Tasks</h2>
      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`p-3 rounded-lg border ${priorityColors[task.priority]}`}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h3 className="font-bold text-white mb-1">{task.title}</h3>
                <p className="text-slate-300 text-sm mb-2">{task.description}</p>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-slate-400">
                    Project: <span className="text-slate-300">{task.project}</span>
                  </span>
                  <span className="text-slate-400">
                    Recovered: <span className="text-slate-300">{formatDate(task.recoveredAt)}</span>
                  </span>
                  <span className="text-slate-400">
                    From: <span className="text-slate-300">{task.recoveredFrom}</span>
                  </span>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-2">
                <select
                  value={task.status}
                  onChange={(e) => updateStatus(task.id, e.target.value as RecoveredTask['status'])}
                  className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="pending">Pending</option>
                  <option value="inprogress">In Progress</option>
                  <option value="done">Done</option>
                </select>
                <span className={`${statusColors[task.status]} text-xs px-2 py-0.5 rounded-full text-black font-medium`}>
                  {statusLabels[task.status]}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}