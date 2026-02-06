'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'

interface Activity {
  id: string
  timestamp: string
  type: 'build' | 'deploy' | 'auth' | 'error' | 'info' | 'agent'
  agent?: string
  message: string
  status: 'success' | 'warning' | 'error' | 'info'
}

export function ActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([
    {
      id: '1',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      type: 'build',
      agent: 'Codex',
      message: 'Building Jackbot Command Center dashboard components',
      status: 'success'
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
      type: 'deploy',
      message: 'lessoncraft.aituned.io → Cloudflare Pages deployment complete',
      status: 'success'
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      type: 'auth',
      message: 'OpenAI Codex (ChatGPT subscription) connected successfully',
      status: 'success'
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
      type: 'agent',
      agent: 'Scout',
      message: 'Completed competitor research: Alex Finn YouTube analytics',
      status: 'success'
    },
    {
      id: '5',
      timestamp: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
      type: 'build',
      message: 'Gospel Tuned Core API tests passed (42/42)',
      status: 'success'
    },
    {
      id: '6',
      timestamp: new Date(Date.now() - 70 * 60 * 1000).toISOString(),
      type: 'error',
      message: 'Voice cloning training failed - insufficient samples',
      status: 'error'
    },
    {
      id: '7',
      timestamp: new Date(Date.now() - 85 * 60 * 1000).toISOString(),
      type: 'info',
      message: 'Daily backup completed: All repos pushed to GitHub',
      status: 'success'
    },
    {
      id: '8',
      timestamp: new Date(Date.now() - 100 * 60 * 1000).toISOString(),
      type: 'agent',
      agent: 'Builder',
      message: 'Infrastructure deployed: Redis cache, PostgreSQL database',
      status: 'success'
    }
  ])

  const [filter, setFilter] = useState<string>('all')
  const [autoScroll, setAutoScroll] = useState(true)

  useEffect(() => {
    // Simulate new activity every 2 minutes
    const interval = setInterval(() => {
      const newActivity: Activity = {
        id: `auto-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'info',
        message: 'System heartbeat: All services operational',
        status: 'success'
      }
      
      setActivities(prev => [newActivity, ...prev.slice(0, 19)]) // Keep last 20
    }, 120000)
    
    return () => clearInterval(interval)
  }, [])

  const filteredActivities = filter === 'all' 
    ? activities 
    : activities.filter(a => a.type === filter)

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    
    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    return `${Math.floor(diffMins / 60)}h ago`
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'build': return '🔨'
      case 'deploy': return '🚀'
      case 'auth': return '🔑'
      case 'error': return '❌'
      case 'info': return 'ℹ️'
      case 'agent': return '🤖'
      default: return '📝'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-400'
      case 'warning': return 'text-yellow-400'
      case 'error': return 'text-red-400'
      case 'info': return 'text-blue-400'
      default: return 'text-slate-400'
    }
  }

  const clearActivities = () => {
    if (window.confirm('Clear all activity logs?')) {
      setActivities([])
    }
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Live Activity Feed</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`px-3 py-1 text-xs rounded-lg transition-colors ${
              autoScroll 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
            }`}
          >
            {autoScroll ? 'Auto-scroll: ON' : 'Auto-scroll: OFF'}
          </button>
          <button
            onClick={clearActivities}
            className="px-3 py-1 text-xs bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>
      
      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 text-xs rounded-lg transition-colors ${
            filter === 'all'
              ? 'bg-amber-500 text-white'
              : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('build')}
          className={`px-3 py-1 text-xs rounded-lg transition-colors ${
            filter === 'build'
              ? 'bg-blue-500 text-white'
              : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
          }`}
        >
          🔨 Build
        </button>
        <button
          onClick={() => setFilter('deploy')}
          className={`px-3 py-1 text-xs rounded-lg transition-colors ${
            filter === 'deploy'
              ? 'bg-purple-500 text-white'
              : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
          }`}
        >
          🚀 Deploy
        </button>
        <button
          onClick={() => setFilter('agent')}
          className={`px-3 py-1 text-xs rounded-lg transition-colors ${
            filter === 'agent'
              ? 'bg-green-500 text-white'
              : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
          }`}
        >
          🤖 Agent
        </button>
        <button
          onClick={() => setFilter('error')}
          className={`px-3 py-1 text-xs rounded-lg transition-colors ${
            filter === 'error'
              ? 'bg-red-500 text-white'
              : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
          }`}
        >
          ❌ Error
        </button>
      </div>
      
      {/* Activity List */}
      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {filteredActivities.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            No activities to show
          </div>
        ) : (
          filteredActivities.map(activity => (
            <div 
              key={activity.id}
              className="p-3 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="text-lg mt-0.5">{getTypeIcon(activity.type)}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">
                        {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                      </span>
                      {activity.agent && (
                        <span className="text-xs px-2 py-0.5 bg-slate-800/50 text-slate-300 rounded">
                          {activity.agent}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500">
                      {formatTime(activity.timestamp)}
                    </div>
                  </div>
                  <div className={`text-sm ${getStatusColor(activity.status)}`}>
                    {activity.message}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Stats */}
      <div className="mt-4 pt-4 border-t border-slate-800">
        <div className="flex items-center justify-between text-sm">
          <div>
            <span className="text-slate-400">Total Activities: </span>
            <span className="text-white">{activities.length}</span>
          </div>
          <div className="flex items-center gap-4">
            <div>
              <span className="text-slate-400">Last hour: </span>
              <span className="text-green-400">
                {activities.filter(a => {
                  const activityTime = new Date(a.timestamp)
                  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
                  return activityTime > oneHourAgo
                }).length}
              </span>
            </div>
            <div>
              <span className="text-slate-400">Errors: </span>
              <span className="text-red-400">
                {activities.filter(a => a.status === 'error').length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}