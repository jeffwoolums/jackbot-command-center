'use client'

interface TimelineEvent {
  id: string
  title: string
  date: string
  type: 'deadline' | 'milestone' | 'cron'
  project?: string
  schedule?: string
}

interface Props {
  events: TimelineEvent[]
}

const typeStyles = {
  deadline: { bg: 'bg-red-500/20', border: 'border-red-500', text: 'text-red-400', icon: '🎯' },
  milestone: { bg: 'bg-amber-500/20', border: 'border-amber-500', text: 'text-amber-400', icon: '🏆' },
  cron: { bg: 'bg-blue-500/20', border: 'border-blue-500', text: 'text-blue-400', icon: '🔄' }
}

function formatDate(dateStr: string): string {
  if (dateStr === 'recurring') return 'Recurring'
  const date = new Date(dateStr)
  const now = new Date()
  const diff = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff < 0) return `${Math.abs(diff)}d overdue`
  if (diff <= 7) return `${diff} days`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getDaysUntil(dateStr: string): number {
  if (dateStr === 'recurring') return 999
  const date = new Date(dateStr)
  const now = new Date()
  return Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

export default function CalendarTimeline({ events }: Props) {
  // Sort events by date (recurring at end)
  const sortedEvents = [...events].sort((a, b) => {
    if (a.date === 'recurring') return 1
    if (b.date === 'recurring') return -1
    return new Date(a.date).getTime() - new Date(b.date).getTime()
  })

  const upcomingEvents = sortedEvents.filter(e => e.date === 'recurring' || getDaysUntil(e.date) >= 0)
  const cronEvents = upcomingEvents.filter(e => e.type === 'cron')
  const dateEvents = upcomingEvents.filter(e => e.type !== 'cron')

  return (
    <div className="space-y-4">
      {/* Timeline */}
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-700" />
        
        <div className="space-y-3">
          {dateEvents.map((event) => {
            const style = typeStyles[event.type]
            const daysUntil = getDaysUntil(event.date)
            const isUrgent = daysUntil <= 3 && daysUntil >= 0
            
            return (
              <div key={event.id} className="flex items-start gap-4 pl-2">
                {/* Timeline dot */}
                <div className={`relative z-10 w-5 h-5 rounded-full ${style.bg} border-2 ${style.border} flex items-center justify-center text-xs`}>
                  {style.icon}
                </div>
                
                {/* Event card */}
                <div className={`flex-1 p-3 rounded-lg ${style.bg} border ${style.border} ${
                  isUrgent ? 'animate-pulse' : ''
                }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className={`font-medium ${style.text}`}>{event.title}</div>
                      {event.project && (
                        <div className="text-xs text-slate-500">{event.project}</div>
                      )}
                    </div>
                    <div className={`text-sm font-mono ${
                      isUrgent ? 'text-red-400 font-bold' : style.text
                    }`}>
                      {formatDate(event.date)}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Cron Jobs Section */}
      {cronEvents.length > 0 && (
        <div className="pt-4 border-t border-slate-800">
          <h4 className="text-sm text-slate-500 mb-2">🔄 Recurring Jobs</h4>
          <div className="grid grid-cols-2 gap-2">
            {cronEvents.map((event) => (
              <div 
                key={event.id}
                className="p-2 bg-slate-800 rounded border border-slate-700 text-sm"
              >
                <div className="text-blue-400">{event.title}</div>
                <div className="text-xs text-slate-500">{event.schedule}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
