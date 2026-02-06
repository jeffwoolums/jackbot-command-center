'use client'

import { useState, useEffect } from 'react'

interface Directive {
  id: string
  title: string
  description: string
  category: 'Feature Request' | 'Bug Fix' | 'Clarification' | 'Priority Change'
  project: string
  status: 'New' | 'Acknowledged' | 'In Progress' | 'Done'
  priority: 'P1' | 'P2' | 'P3' | 'P4'
  createdAt: string
  updatedAt: string
  createdBy: string
}

interface Props {
  projects: Array<{ id: string; name: string }>
}

const categoryColors = {
  'Feature Request': 'bg-blue-500',
  'Bug Fix': 'bg-red-500',
  'Clarification': 'bg-yellow-500',
  'Priority Change': 'bg-purple-500'
}

const statusColors = {
  'New': 'bg-slate-500',
  'Acknowledged': 'bg-amber-500',
  'In Progress': 'bg-blue-500',
  'Done': 'bg-green-500'
}

const priorityColors = {
  'P1': 'text-red-400',
  'P2': 'text-amber-400',
  'P3': 'text-yellow-400',
  'P4': 'text-slate-400'
}

export default function ChairmanDirectives({ projects }: Props) {
  const [directives, setDirectives] = useState<Directive[]>([])
  const [loading, setLoading] = useState(true)
  const [newDirective, setNewDirective] = useState({
    title: '',
    description: '',
    category: 'Feature Request' as Directive['category'],
    project: '',
    priority: 'P2' as Directive['priority']
  })

  useEffect(() => {
    fetchDirectives()
  }, [])

  const fetchDirectives = async () => {
    try {
      const res = await fetch('/api/chairman-directives', { cache: 'no-store' })
      const data = await res.json()
      setDirectives(data.directives || [])
    } catch (e) {
      console.error('Failed to fetch directives:', e)
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDirective.title.trim() || !newDirective.project) return

    try {
      await fetch('/api/chairman-directives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newDirective,
          status: 'New',
          createdBy: 'Jeff'
        })
      })

      setNewDirective({
        title: '',
        description: '',
        category: 'Feature Request',
        project: '',
        priority: 'P2'
      })
      
      fetchDirectives()
    } catch (e) {
      console.error('Failed to add directive:', e)
    }
  }

  const updateStatus = async (id: string, newStatus: Directive['status']) => {
    try {
      await fetch('/api/chairman-directives', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      })
      fetchDirectives()
    } catch (e) {
      console.error('Failed to update directive:', e)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      {/* Add Directive Form */}
      <div className="p-4 bg-slate-900 rounded-lg border border-amber-500/30">
        <h3 className="text-lg font-bold text-amber-400 mb-4">🎯 Add Chairman Directive</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Title</label>
              <input
                type="text"
                value={newDirective.title}
                onChange={(e) => setNewDirective({...newDirective, title: e.target.value})}
                placeholder="What needs to be done?"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Project</label>
              <select
                value={newDirective.project}
                onChange={(e) => setNewDirective({...newDirective, project: e.target.value})}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                required
              >
                <option value="">Select project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Description</label>
            <textarea
              value={newDirective.description}
              onChange={(e) => setNewDirective({...newDirective, description: e.target.value})}
              placeholder="Details and context..."
              rows={3}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Category</label>
              <select
                value={newDirective.category}
                onChange={(e) => setNewDirective({...newDirective, category: e.target.value as Directive['category']})}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Feature Request">Feature Request</option>
                <option value="Bug Fix">Bug Fix</option>
                <option value="Clarification">Clarification</option>
                <option value="Priority Change">Priority Change</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Priority</label>
              <select
                value={newDirective.priority}
                onChange={(e) => setNewDirective({...newDirective, priority: e.target.value as Directive['priority']})}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              >
                <option value="P1">P1 - Critical</option>
                <option value="P2">P2 - High</option>
                <option value="P3">P3 - Medium</option>
                <option value="P4">P4 - Low</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold px-4 py-2 rounded-lg transition-colors"
              >
                Add Directive
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Directives List */}
      <div>
        <h3 className="text-lg font-bold text-amber-400 mb-4">📋 Chairman Directives</h3>
        {loading ? (
          <div className="text-center py-8 text-slate-500">Loading directives...</div>
        ) : directives.length === 0 ? (
          <div className="text-center py-8 text-slate-500">No directives yet</div>
        ) : (
          <div className="space-y-3">
            {directives.map((directive) => (
              <div
                key={directive.id}
                className="p-4 bg-slate-900 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-white">{directive.title}</h4>
                      <span className={`${priorityColors[directive.priority]} text-xs font-medium`}>
                        {directive.priority}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm mb-2">{directive.description}</p>
                    <div className="flex items-center gap-3 text-xs">
                      <span className={`${categoryColors[directive.category]} text-black px-2 py-0.5 rounded-full`}>
                        {directive.category}
                      </span>
                      <span className="text-slate-500">
                        Project: <span className="text-slate-300">{directive.project}</span>
                      </span>
                      <span className="text-slate-500">
                        Added: <span className="text-slate-300">{formatDate(directive.createdAt)}</span>
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <select
                      value={directive.status}
                      onChange={(e) => updateStatus(directive.id, e.target.value as Directive['status'])}
                      className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="New">New</option>
                      <option value="Acknowledged">Acknowledged</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Done">Done</option>
                    </select>
                    <span className={`${statusColors[directive.status]} text-xs px-2 py-0.5 rounded-full text-black font-medium`}>
                      {directive.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}