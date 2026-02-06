'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { StatusDot } from '@/components/ui/StatusDot'

interface Project {
  id: string
  name: string
  description: string
  status: 'building' | 'live' | 'planning'
  progress: number
  url?: string
  repo: string
  lastCommit: string
  buildStatus: 'success' | 'building' | 'failed' | 'pending'
  technologies: string[]
}

export function ProjectTracker() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProjects()
    const interval = setInterval(fetchProjects, 60000) // Refresh every minute
    return () => clearInterval(interval)
  }, [])

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects')
      const data = await response.json()
      setProjects(data.projects)
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'text-green-400'
      case 'building': return 'text-amber-400'
      case 'planning': return 'text-blue-400'
      default: return 'text-slate-400'
    }
  }

  const getBuildStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return '✅'
      case 'building': return '🔄'
      case 'failed': return '❌'
      case 'pending': return '⏳'
      default: return '📝'
    }
  }

  const formatCommitTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    
    if (diffHours < 1) return 'just now'
    if (diffHours < 24) return `${diffHours}h ago`
    return `${Math.floor(diffHours / 24)}d ago`
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Project Tracker</h2>
        <span className="text-xs text-slate-400">Git Integration</span>
      </div>
      
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-20 bg-slate-800/50 rounded-lg"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map(project => (
            <div 
              key={project.id} 
              className="p-3 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-white">{project.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded ${getStatusColor(project.status)} bg-slate-800/50`}>
                      {project.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 mt-1">{project.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-400">
                    {getBuildStatusIcon(project.buildStatus)} {project.buildStatus}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {formatCommitTime(project.lastCommit)}
                  </div>
                </div>
              </div>
              
              <div className="mt-3">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      project.status === 'live' ? 'bg-green-500' :
                      project.status === 'building' ? 'bg-amber-500' :
                      'bg-blue-500'
                    }`}
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-3">
                <div className="flex flex-wrap gap-1">
                  {project.technologies.slice(0, 3).map(tech => (
                    <span key={tech} className="text-xs px-2 py-1 bg-slate-800/50 text-slate-300 rounded">
                      {tech}
                    </span>
                  ))}
                  {project.technologies.length > 3 && (
                    <span className="text-xs px-2 py-1 bg-slate-800/50 text-slate-400 rounded">
                      +{project.technologies.length - 3}
                    </span>
                  )}
                </div>
                
                {project.url && (
                  <a 
                    href={project.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    Visit →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-4 pt-4 border-t border-slate-800">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Total Projects: {projects.length}</span>
          <div className="flex items-center gap-4">
            <span className="text-green-400">
              Live: {projects.filter(p => p.status === 'live').length}
            </span>
            <span className="text-amber-400">
              Building: {projects.filter(p => p.status === 'building').length}
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}