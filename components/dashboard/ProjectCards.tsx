'use client'

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

interface Props {
  projects: Project[]
}

const statusColors = {
  active: 'bg-green-500',
  blocked: 'bg-red-500',
  complete: 'bg-blue-500'
}

const statusLabels = {
  active: 'Active',
  blocked: 'Blocked',
  complete: 'Complete'
}

const ownerColors: Record<string, string> = {
  Jackbot: 'text-amber-400',
  Codex: 'text-purple-400',
  KIMI: 'text-pink-400'
}

export default function ProjectCards({ projects }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {projects.map((project) => (
        <div
          key={project.id}
          className={`p-4 bg-slate-900 rounded-lg border transition-all hover:scale-[1.02] hover:shadow-lg ${
            project.status === 'blocked' 
              ? 'border-red-500/50 hover:border-red-400' 
              : project.priority === 'high'
              ? 'border-amber-500/30 hover:border-amber-400'
              : 'border-slate-700 hover:border-slate-500'
          }`}
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

          {/* Owner */}
          <div className="flex items-center justify-between">
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
        </div>
      ))}
    </div>
  )
}
