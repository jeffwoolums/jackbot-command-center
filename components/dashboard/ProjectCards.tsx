'use client'

import { useState } from 'react'

interface Project {
  id: string
  name: string
  status: 'active' | 'blocked' | 'complete' | 'on-hold'
  progress: number
  nextAction: string
  owner: string
  description: string
  priority: string
  needsDecision?: boolean
  decisionQuestion?: string
}

interface Props {
  projects: Project[]
  onProjectClick?: (project: Project) => void
  onDecision?: (projectId: string, decision: 'approve' | 'research' | 'build' | 'pause') => void
}

const statusColors = {
  active: 'bg-green-500',
  blocked: 'bg-red-500',
  complete: 'bg-blue-500',
  'on-hold': 'bg-yellow-500'
}

const statusLabels = {
  active: 'Active',
  blocked: 'Blocked',
  complete: 'Complete',
  'on-hold': 'On Hold'
}

const ownerColors: Record<string, string> = {
  Jackbot: 'text-amber-400',
  Codex: 'text-purple-400',
  KIMI: 'text-pink-400'
}

export default function ProjectCards({ projects, onProjectClick, onDecision }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const needsInput = (project: Project) => {
    return project.status === 'blocked' || project.status === 'on-hold' || project.needsDecision
  }

  const handleDecision = (e: React.MouseEvent, projectId: string, decision: 'approve' | 'research' | 'build' | 'pause') => {
    e.stopPropagation()
    onDecision?.(projectId, decision)
    setExpandedId(null)
  }

  const toggleExpand = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation()
    setExpandedId(expandedId === projectId ? null : projectId)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {projects.map((project) => (
        <div
          key={project.id}
          onClick={() => onProjectClick?.(project)}
          className={`p-4 bg-slate-900 rounded-lg border transition-all hover:shadow-lg cursor-pointer ${
            project.status === 'blocked' 
              ? 'border-red-500/50 hover:border-red-400' 
              : project.status === 'on-hold'
              ? 'border-yellow-500/50 hover:border-yellow-400'
              : project.priority === 'high'
              ? 'border-amber-500/30 hover:border-amber-400'
              : 'border-slate-700 hover:border-slate-500'
          } ${needsInput(project) ? 'animate-pulse-subtle' : ''}`}
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-bold text-white truncate">{project.name}</h3>
            <span className={`${statusColors[project.status]} text-xs px-2 py-0.5 rounded-full text-black font-medium`}>
              {statusLabels[project.status]}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">Progress</span>
              <span className={project.progress === 100 ? 'text-green-400' : 'text-amber-400'}>
                {project.progress}%
              </span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${
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
          </div>

          {/* Next Action */}
          <div className="mb-3">
            <div className="text-xs text-slate-500 mb-1">Next Action</div>
            <div className="text-sm text-slate-300 line-clamp-2">{project.nextAction}</div>
          </div>

          {/* Decision Question (if blocked/on-hold) */}
          {needsInput(project) && project.decisionQuestion && (
            <div className="mb-3 p-2 bg-amber-500/10 border border-amber-500/30 rounded">
              <div className="text-xs text-amber-400 font-medium mb-1">⚠️ Needs Decision:</div>
              <div className="text-xs text-amber-200">{project.decisionQuestion}</div>
            </div>
          )}

          {/* Owner */}
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${ownerColors[project.owner] || 'text-slate-400'}`}>
              {project.owner === 'Jackbot' && '🤖 '}
              {project.owner === 'Codex' && '💪 '}
              {project.owner === 'KIMI' && '👩‍💼 '}
              {project.owner}
            </span>
            {project.priority === 'high' && (
              <span className="text-xs text-amber-500">⚡ HIGH</span>
            )}
          </div>

          {/* Decision Buttons for blocked/on-hold projects */}
          {needsInput(project) && (
            <div className="mt-3 pt-3 border-t border-slate-700">
              {expandedId === project.id ? (
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={(e) => handleDecision(e, project.id, 'approve')}
                    className="px-3 py-1 bg-green-500/20 text-green-400 rounded text-xs hover:bg-green-500/30 transition-colors"
                  >
                    ✅ Approve
                  </button>
                  <button 
                    onClick={(e) => handleDecision(e, project.id, 'build')}
                    className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded text-xs hover:bg-amber-500/30 transition-colors"
                  >
                    🚀 Build Now
                  </button>
                  <button 
                    onClick={(e) => handleDecision(e, project.id, 'research')}
                    className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded text-xs hover:bg-blue-500/30 transition-colors"
                  >
                    🔍 Research
                  </button>
                  <button 
                    onClick={(e) => handleDecision(e, project.id, 'pause')}
                    className="px-3 py-1 bg-slate-500/20 text-slate-400 rounded text-xs hover:bg-slate-500/30 transition-colors"
                  >
                    ⏸️ Pause
                  </button>
                </div>
              ) : (
                <button 
                  onClick={(e) => toggleExpand(e, project.id)}
                  className="w-full py-2 bg-amber-500/10 text-amber-400 rounded text-xs hover:bg-amber-500/20 transition-colors font-medium"
                >
                  👑 Make Decision
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
