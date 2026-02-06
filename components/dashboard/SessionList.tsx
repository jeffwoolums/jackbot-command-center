'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { StatusDot } from '@/components/ui/StatusDot'

interface Session {
  id: string
  name: string
  channel: string
  status: 'active' | 'idle' | 'offline'
  lastActive: string
  lastActiveRelative: string
  messages: number
  agent: string
  model: string
}

export function SessionList() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSessions()
    const interval = setInterval(fetchSessions, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [])

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/sessions')
      const data = await response.json()
      setSessions(data.sessions)
    } catch (error) {
      console.error('Failed to fetch sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'telegram': return '📱'
      case 'discord': return '💬'
      case 'whatsapp': return '📲'
      default: return '💻'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400'
      case 'idle': return 'text-yellow-400'
      case 'offline': return 'text-red-400'
      default: return 'text-slate-400'
    }
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">OpenClaw Sessions</h2>
        <span className="text-xs text-slate-400">Live</span>
      </div>
      
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-slate-800/50 rounded-lg"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map(session => (
            <div 
              key={session.id} 
              className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <StatusDot status={session.status} />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{session.name}</span>
                    <span className="text-xs text-slate-400">{getChannelIcon(session.channel)}</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {session.agent} • {session.model}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className={`text-sm font-medium ${getStatusColor(session.status)}`}>
                  {session.lastActiveRelative}
                </div>
                <div className="text-xs text-slate-400">
                  {session.messages} messages
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-4 pt-4 border-t border-slate-800">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Total Sessions: {sessions.length}</span>
          <span className="text-green-400">
            Active: {sessions.filter(s => s.status === 'active').length}
          </span>
        </div>
      </div>
    </Card>
  )
}