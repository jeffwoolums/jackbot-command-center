'use client'

interface Blocker {
  id: string
  title: string
  project: string
  description: string
  impact: 'high' | 'medium' | 'low'
  needsDecision: boolean
  createdAt: string
}

interface Props {
  blockers: Blocker[]
}

function getDaysAgo(dateStr: string): number {
  const date = new Date(dateStr)
  const now = new Date()
  return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
}

export default function BlockersPanel({ blockers }: Props) {
  if (blockers.length === 0) {
    return (
      <div className="p-6 bg-green-500/10 border border-green-500/30 rounded-lg text-center">
        <div className="text-4xl mb-2">✅</div>
        <div className="text-green-400 font-medium">No blockers!</div>
        <div className="text-sm text-slate-500">All clear - keep building!</div>
      </div>
    )
  }

  const decisionNeeded = blockers.filter(b => b.needsDecision)
  const otherBlockers = blockers.filter(b => !b.needsDecision)

  return (
    <div className="space-y-3">
      {/* Decision Needed - Urgent */}
      {decisionNeeded.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm text-red-400 font-bold flex items-center gap-2">
            <span className="animate-pulse">🚨</span> NEEDS YOUR DECISION
          </h4>
          {decisionNeeded.map((blocker) => (
            <div 
              key={blocker.id}
              className="p-4 bg-red-500/10 border-2 border-red-500 rounded-lg animate-pulse"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="font-bold text-red-400">{blocker.title}</div>
                <span className={`text-xs px-2 py-0.5 rounded ${
                  blocker.impact === 'high' 
                    ? 'bg-red-500 text-white' 
                    : blocker.impact === 'medium'
                    ? 'bg-yellow-500 text-black'
                    : 'bg-slate-500 text-white'
                }`}>
                  {blocker.impact.toUpperCase()}
                </span>
              </div>
              <div className="text-sm text-slate-300 mb-2">{blocker.description}</div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>📁 {blocker.project}</span>
                <span>{getDaysAgo(blocker.createdAt)}d ago</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Other Blockers */}
      {otherBlockers.length > 0 && (
        <div className="space-y-2">
          {decisionNeeded.length > 0 && (
            <h4 className="text-sm text-orange-400 font-medium">Other Blockers</h4>
          )}
          {otherBlockers.map((blocker) => (
            <div 
              key={blocker.id}
              className="p-3 bg-orange-500/10 border border-orange-500/50 rounded-lg"
            >
              <div className="flex justify-between items-start mb-1">
                <div className="font-medium text-orange-400">{blocker.title}</div>
                <span className={`text-xs px-2 py-0.5 rounded ${
                  blocker.impact === 'high' 
                    ? 'bg-red-500/50 text-red-200' 
                    : blocker.impact === 'medium'
                    ? 'bg-yellow-500/50 text-yellow-200'
                    : 'bg-slate-500/50 text-slate-200'
                }`}>
                  {blocker.impact}
                </span>
              </div>
              <div className="text-sm text-slate-400">{blocker.description}</div>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      <div className="pt-2 border-t border-slate-800 text-center">
        <span className="text-sm text-slate-500">
          {blockers.length} blocker{blockers.length > 1 ? 's' : ''} • 
          {decisionNeeded.length > 0 && (
            <span className="text-red-400"> {decisionNeeded.length} need decision</span>
          )}
        </span>
      </div>
    </div>
  )
}
