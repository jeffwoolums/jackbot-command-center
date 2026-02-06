'use client'

import { useState, useEffect } from 'react'

interface Session {
  key: string
  kind: string
  model: string
  age: string
  tokens: string
}

interface CronJob {
  id: string
  name: string
  schedule: string
  next: string
  status: string
}

export default function CommandCenter() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [sessions, setSessions] = useState<Session[]>([])
  const [cronJobs, setCronJobs] = useState<CronJob[]>([])
  const [loading, setLoading] = useState(true)
  const [spawnTask, setSpawnTask] = useState('')
  const [spawning, setSpawning] = useState(false)

  // Fetch real data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/status')
        const data = await res.json()
        if (data.sessions) setSessions(data.sessions)
        if (data.cronJobs) setCronJobs(data.cronJobs)
      } catch (e) {
        console.error('Failed to fetch status:', e)
      }
      setLoading(false)
    }
    fetchData()
    const interval = setInterval(fetchData, 5000) // Poll every 5s
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const spawnAgent = async () => {
    if (!spawnTask.trim()) return
    setSpawning(true)
    try {
      await fetch('/api/spawn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: spawnTask })
      })
      setSpawnTask('')
    } catch (e) {
      console.error('Spawn failed:', e)
    }
    setSpawning(false)
  }

  const formatTime = (date: Date) => date.toLocaleTimeString('en-US', { 
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false 
  })

  const formatDate = (date: Date) => date.toLocaleDateString('en-US', { 
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
  })

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      {/* Header */}
      <header className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-500 to-amber-300 bg-clip-text text-transparent">
            🤖 Jackbot Command Center
          </h1>
          <p className="text-slate-400 mt-2">AI Empire Operations Dashboard</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-mono text-amber-400">{formatTime(currentTime)}</div>
          <div className="text-slate-400">{formatDate(currentTime)}</div>
          <div className="mt-2 flex items-center justify-end gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-green-400 text-sm">LIVE</span>
          </div>
        </div>
      </header>

      {/* Spawn Agent */}
      <div className="mb-8 p-4 bg-slate-900 rounded-lg border border-amber-500/30">
        <div className="flex gap-4">
          <input
            type="text"
            value={spawnTask}
            onChange={(e) => setSpawnTask(e.target.value)}
            placeholder="Enter task for Codex agent..."
            className="flex-1 bg-slate-800 border border-slate-700 rounded px-4 py-2 text-white placeholder-slate-500"
            onKeyDown={(e) => e.key === 'Enter' && spawnAgent()}
          />
          <button
            onClick={spawnAgent}
            disabled={spawning || !spawnTask.trim()}
            className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-bold px-6 py-2 rounded"
          >
            {spawning ? 'Spawning...' : '🚀 Spawn Agent'}
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="p-4 bg-slate-900 rounded-lg border border-green-500/30">
          <div className="text-slate-400 text-sm mb-1">System Status</div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-2xl font-bold text-green-400">ONLINE</span>
          </div>
        </div>
        <div className="p-4 bg-slate-900 rounded-lg border border-slate-700">
          <div className="text-slate-400 text-sm mb-1">Active Sessions</div>
          <div className="text-2xl font-bold">{sessions.length}</div>
        </div>
        <div className="p-4 bg-slate-900 rounded-lg border border-slate-700">
          <div className="text-slate-400 text-sm mb-1">Cron Jobs</div>
          <div className="text-2xl font-bold">{cronJobs.length}</div>
        </div>
        <div className="p-4 bg-slate-900 rounded-lg border border-slate-700">
          <div className="text-slate-400 text-sm mb-1">Voice System</div>
          <div className="text-2xl font-bold text-green-400">READY</div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* Sessions */}
        <div className="p-4 bg-slate-900 rounded-lg border border-slate-700">
          <h2 className="text-lg font-bold text-amber-400 mb-4">Live Sessions</h2>
          {loading ? (
            <div className="text-slate-500">Loading...</div>
          ) : sessions.length === 0 ? (
            <div className="text-slate-500">No active sessions</div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {sessions.map((s, i) => (
                <div key={i} className="p-3 bg-slate-800 rounded flex justify-between items-center">
                  <div>
                    <div className="font-mono text-sm">{s.key?.slice(0, 30)}...</div>
                    <div className="text-xs text-slate-400">{s.model}</div>
                  </div>
                  <div className="text-xs text-slate-400">{s.age}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cron Jobs */}
        <div className="p-4 bg-slate-900 rounded-lg border border-slate-700">
          <h2 className="text-lg font-bold text-amber-400 mb-4">Scheduled Jobs</h2>
          {loading ? (
            <div className="text-slate-500">Loading...</div>
          ) : cronJobs.length === 0 ? (
            <div className="text-slate-500">No cron jobs</div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {cronJobs.map((job, i) => (
                <div key={i} className="p-3 bg-slate-800 rounded flex justify-between items-center">
                  <div>
                    <div className="font-medium">{job.name}</div>
                    <div className="text-xs text-slate-400">{job.schedule}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-green-400">{job.status}</div>
                    <div className="text-xs text-slate-400">Next: {job.next}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-8 text-center text-slate-500 text-sm">
        <p>Jackbot Command Center v1.1 • Gospel Tuned Empire • Building to a Billion 🚀</p>
      </footer>
    </div>
  )
}
