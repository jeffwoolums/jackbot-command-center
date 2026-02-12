'use client'

import { useState, useEffect, useCallback } from 'react'
import ProjectCards from '@/components/dashboard/ProjectCards'
import KanbanBoard from '@/components/dashboard/KanbanBoard'
import CalendarTimeline from '@/components/dashboard/CalendarTimeline'
import BlockersPanel from '@/components/dashboard/BlockersPanel'
import AgentStatusPanel from '@/components/dashboard/AgentStatusPanel'
import ChairmanDirectives from '@/components/dashboard/ChairmanDirectives'
import RecoveredTasksPanel from '@/components/dashboard/RecoveredTasksPanel'
import ProjectDetailModal from '@/components/dashboard/ProjectDetailModal'
import VoiceDashboard from '@/components/dashboard/VoiceDashboard'

interface ProjectData {
  projects: Array<{
    id: string
    name: string
    status: 'active' | 'blocked' | 'complete'
    progress: number
    nextAction: string
    owner: string
    description: string
    priority: string
  }>
  tasks: Array<{
    id: string
    title: string
    project: string
    status: string
    priority: string
    owner: string
  }>
  blockers: Array<{
    id: string
    title: string
    project: string
    description: string
    impact: 'high' | 'medium' | 'low'
    needsDecision: boolean
    createdAt: string
  }>
  agents: Array<{
    id: string
    name: string
    status: 'active' | 'idle' | 'offline'
    currentTask: string | null
    avatar: string
    specialty: string
  }>
  timeline: Array<{
    id: string
    title: string
    date: string
    type: 'deadline' | 'milestone' | 'cron'
    project?: string
    schedule?: string
  }>
}

type ViewMode = 'dashboard' | 'projects' | 'chairman' | 'timeline'

export default function CommandCenter() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [data, setData] = useState<ProjectData | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard')
  const [spawnTask, setSpawnTask] = useState('')
  const [spawning, setSpawning] = useState(false)
  const [selectedProject, setSelectedProject] = useState<ProjectData['projects'][0] | null>(null)
  const [showProjectDetail, setShowProjectDetail] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/projects', { cache: 'no-store' })
      const projectData = await res.json()
      setData(projectData)
    } catch (e) {
      console.error('Failed to fetch:', e)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 10000) // Poll every 10s
    return () => clearInterval(interval)
  }, [fetchData])

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const handleTaskMove = async (taskId: string, newStatus: string) => {
    try {
      await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, newStatus })
      })
      fetchData() // Refresh data
    } catch (e) {
      console.error('Failed to update task:', e)
    }
  }

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

  const handleProjectClick = (project: ProjectData['projects'][0]) => {
    setSelectedProject(project)
    setShowProjectDetail(true)
  }

  const formatTime = (date: Date) => date.toLocaleTimeString('en-US', { 
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false 
  })

  const formatDate = (date: Date) => date.toLocaleDateString('en-US', { 
    weekday: 'long', month: 'long', day: 'numeric'
  })

  // Calculate stats
  const activeProjects = data?.projects.filter(p => p.status === 'active').length || 0
  const blockedProjects = data?.projects.filter(p => p.status === 'blocked').length || 0
  const avgProgress = data?.projects.length 
    ? Math.round(data.projects.reduce((sum, p) => sum + p.progress, 0) / data.projects.length) 
    : 0

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur border-b border-slate-800 px-6 py-4">
        <div className="flex justify-between items-center max-w-[1800px] mx-auto">
          <div className="flex items-center gap-6">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
                🤖 Jackbot Command Center v2.0
              </h1>
              <p className="text-slate-500 text-sm">Gospel Tuned Empire HQ • Enhanced Edition</p>
            </div>
            
            {/* Enhanced Navigation */}
            <div className="flex items-center gap-3">
              <div className="flex bg-slate-900 rounded-lg p-1">
                {(['dashboard', 'projects', 'chairman', 'timeline'] as ViewMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      viewMode === mode
                        ? 'bg-amber-500 text-black'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {mode === 'dashboard' && '📊 Dashboard'}
                    {mode === 'projects' && '📂 Projects'}
                    {mode === 'chairman' && '👑 Chairman'}
                    {mode === 'timeline' && '📅 Timeline'}
                  </button>
                ))}
              </div>

              <a
                href="/lessoncraft"
                className="px-3 py-2 rounded-md text-sm font-medium border border-purple-500/40 bg-purple-500/10 text-purple-200 hover:bg-purple-500/20 transition-all"
              >
                🎧 LessonCraft
              </a>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Live indicator */}
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-green-400 text-sm font-medium">LIVE</span>
            </div>
            
            {/* Time */}
            <div className="text-right">
              <div className="text-xl font-mono text-amber-400">{formatTime(currentTime)}</div>
              <div className="text-slate-500 text-sm">{formatDate(currentTime)}</div>
            </div>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-[1800px] mx-auto">
        {/* Spawn Agent Bar */}
        <div className="mb-6 p-4 bg-slate-900 rounded-lg border border-amber-500/30">
          <div className="flex gap-4">
            <input
              type="text"
              value={spawnTask}
              onChange={(e) => setSpawnTask(e.target.value)}
              placeholder="🚀 Spawn a Codex agent with a task..."
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              onKeyDown={(e) => e.key === 'Enter' && spawnAgent()}
            />
            <button
              onClick={spawnAgent}
              disabled={spawning || !spawnTask.trim()}
              className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:hover:bg-amber-500 text-black font-bold px-6 py-2.5 rounded-lg transition-colors"
            >
              {spawning ? '⏳ Spawning...' : '🚀 Spawn'}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-slate-500 text-lg">Loading dashboard...</div>
          </div>
        ) : !data ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-red-500 text-lg">Failed to load data</div>
          </div>
        ) : (
          <>
            {/* DASHBOARD VIEW */}
            {viewMode === 'dashboard' && (
              <div className="space-y-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-5 gap-4">
                  <div className="p-4 bg-slate-900 rounded-lg border border-green-500/30">
                    <div className="text-slate-400 text-sm">Active</div>
                    <div className="text-2xl font-bold text-green-400">{activeProjects}</div>
                  </div>
                  <div className="p-4 bg-slate-900 rounded-lg border border-red-500/30">
                    <div className="text-slate-400 text-sm">Blocked</div>
                    <div className="text-2xl font-bold text-red-400">{blockedProjects}</div>
                  </div>
                  <div className="p-4 bg-slate-900 rounded-lg border border-amber-500/30">
                    <div className="text-slate-400 text-sm">Avg Progress</div>
                    <div className="text-2xl font-bold text-amber-400">{avgProgress}%</div>
                  </div>
                  <div className="p-4 bg-slate-900 rounded-lg border border-blue-500/30">
                    <div className="text-slate-400 text-sm">Tasks</div>
                    <div className="text-2xl font-bold text-blue-400">{data?.tasks.length || 0}</div>
                  </div>
                  <div className="p-4 bg-slate-900 rounded-lg border border-purple-500/30">
                    <div className="text-slate-400 text-sm">Agents</div>
                    <div className="text-2xl font-bold text-purple-400">
                      {data?.agents.filter(a => a.status !== 'offline').length || 0}
                    </div>
                  </div>
                </div>

                {/* Project Cards */}
                <section>
                  <h2 className="text-lg font-bold text-amber-400 mb-4">📂 Projects</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {data.projects.map((project) => (
                      <div
                        key={project.id}
                        onClick={() => handleProjectClick(project)}
                        className={`p-4 bg-slate-900 rounded-lg border transition-all hover:scale-[1.02] hover:shadow-lg cursor-pointer ${
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
                          <span className={`${
                            project.status === 'active' ? 'bg-green-500' :
                            project.status === 'blocked' ? 'bg-red-500' : 'bg-blue-500'
                          } text-xs px-2 py-0.5 rounded-full text-black font-medium`}>
                            {project.status === 'active' ? 'Active' : 
                             project.status === 'blocked' ? 'Blocked' : 'Complete'}
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
                          <span className={`text-sm font-medium ${
                            project.owner === 'Jackbot' ? 'text-amber-400' :
                            project.owner === 'Codex' ? 'text-purple-400' :
                            project.owner === 'KIMI' ? 'text-pink-400' : 'text-slate-400'
                          }`}>
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
                </section>

                {/* Bottom Grid: Recovered Tasks, Blockers, Agents, Voice */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Recovered Tasks */}
                  <RecoveredTasksPanel />

                  {/* Blockers */}
                  <section className="p-4 bg-slate-900 rounded-lg border border-red-500/30">
                    <h2 className="text-lg font-bold text-red-400 mb-4">🚨 Blockers</h2>
                    <BlockersPanel blockers={data.blockers} />
                  </section>

                  {/* Agents */}
                  <section className="p-4 bg-slate-900 rounded-lg border border-purple-500/30">
                    <h2 className="text-lg font-bold text-purple-400 mb-4">🤖 Agents</h2>
                    <AgentStatusPanel agents={data.agents} />
                  </section>

                  {/* Voice Dashboard */}
                  <VoiceDashboard />
                </div>
              </div>
            )}

            {/* PROJECTS VIEW */}
            {viewMode === 'projects' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-amber-400">📂 All Projects</h2>
                <KanbanBoard initialTasks={data.tasks} onTaskMove={handleTaskMove} />
              </div>
            )}

            {/* CHAIRMAN VIEW */}
            {viewMode === 'chairman' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-amber-400">👑 Chairman's Corner</h2>
                <ChairmanDirectives projects={data.projects} />
              </div>
            )}

            {/* TIMELINE VIEW */}
            {viewMode === 'timeline' && (
              <div className="grid grid-cols-2 gap-6">
                <section className="p-6 bg-slate-900 rounded-lg border border-slate-700">
                  <h2 className="text-lg font-bold text-amber-400 mb-4">📅 Timeline & Deadlines</h2>
                  <CalendarTimeline events={data.timeline} />
                </section>
                <section className="p-6 bg-slate-900 rounded-lg border border-red-500/30">
                  <h2 className="text-lg font-bold text-red-400 mb-4">🚨 Blockers</h2>
                  <BlockersPanel blockers={data.blockers} />
                </section>
              </div>
            )}
          </>
        )}
      </main>

      {/* Project Detail Modal */}
      <ProjectDetailModal
        project={selectedProject}
        isOpen={showProjectDetail}
        onClose={() => setShowProjectDetail(false)}
        onTaskMove={handleTaskMove}
      />

      {/* Footer */}
      <footer className="mt-8 py-4 border-t border-slate-800 text-center text-slate-500 text-sm">
        <p>Jackbot Command Center v2.0 • Enhanced Edition • Gospel Tuned Empire • Building to a Billion 🚀</p>
      </footer>
    </div>
  )
}