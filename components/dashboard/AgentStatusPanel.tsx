'use client'

interface Agent {
  id: string
  name: string
  status: 'active' | 'idle' | 'offline'
  currentTask: string | null
  avatar: string
  specialty: string
}

interface Props {
  agents: Agent[]
}

const statusColors = {
  active: 'bg-green-500',
  idle: 'bg-yellow-500',
  offline: 'bg-slate-600'
}

const statusLabels = {
  active: 'Working',
  idle: 'Available',
  offline: 'Offline'
}

export default function AgentStatusPanel({ agents }: Props) {
  return (
    <div className="space-y-3">
      {agents.map((agent) => (
        <div 
          key={agent.id}
          className={`p-4 bg-slate-800 rounded-lg border transition-all ${
            agent.status === 'active' 
              ? 'border-green-500/50 shadow-lg shadow-green-500/10' 
              : agent.status === 'idle'
              ? 'border-yellow-500/30'
              : 'border-slate-700 opacity-60'
          }`}
        >
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div className="text-3xl">{agent.avatar}</div>
            
            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-white">{agent.name}</span>
                <span className={`w-2 h-2 rounded-full ${statusColors[agent.status]} ${
                  agent.status === 'active' ? 'animate-pulse' : ''
                }`} />
                <span className={`text-xs ${
                  agent.status === 'active' ? 'text-green-400' : 
                  agent.status === 'idle' ? 'text-yellow-400' : 'text-slate-500'
                }`}>
                  {statusLabels[agent.status]}
                </span>
              </div>
              
              <div className="text-xs text-slate-500 mb-2">{agent.specialty}</div>
              
              {agent.currentTask ? (
                <div className="text-sm text-slate-300 bg-slate-900 px-2 py-1 rounded">
                  🔧 {agent.currentTask}
                </div>
              ) : (
                <div className="text-sm text-slate-500 italic">
                  Ready for tasks
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Quick Stats */}
      <div className="pt-3 border-t border-slate-700 grid grid-cols-3 gap-2 text-center">
        <div>
          <div className="text-lg font-bold text-green-400">
            {agents.filter(a => a.status === 'active').length}
          </div>
          <div className="text-xs text-slate-500">Active</div>
        </div>
        <div>
          <div className="text-lg font-bold text-yellow-400">
            {agents.filter(a => a.status === 'idle').length}
          </div>
          <div className="text-xs text-slate-500">Idle</div>
        </div>
        <div>
          <div className="text-lg font-bold text-slate-400">
            {agents.filter(a => a.status === 'offline').length}
          </div>
          <div className="text-xs text-slate-500">Offline</div>
        </div>
      </div>
    </div>
  )
}
