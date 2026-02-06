'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { StatusDot } from '@/components/ui/StatusDot'

interface Agent {
  id: string
  name: string
  description: string
  status: 'ready' | 'active' | 'idle'
  lastRun: string
  tasksCompleted: number
  voice: string
  personality: string
}

export function AgentSpawner() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAgent, setSelectedAgent] = useState<string>('codex')
  const [taskDescription, setTaskDescription] = useState('')
  const [isSpawning, setIsSpawning] = useState(false)
  const [lastSpawned, setLastSpawned] = useState<string | null>(null)

  useEffect(() => {
    fetchAgents()
    const interval = setInterval(fetchAgents, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/agents')
      const data = await response.json()
      setAgents(data.agents)
    } catch (error) {
      console.error('Failed to fetch agents:', error)
    } finally {
      setLoading(false)
    }
  }

  const spawnAgent = async () => {
    if (!taskDescription.trim()) {
      alert('Please enter a task description')
      return
    }

    setIsSpawning(true)
    try {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: selectedAgent,
          task: taskDescription
        })
      })
      
      const data = await response.json()
      if (data.success) {
        setLastSpawned(`${selectedAgent} - ${taskDescription}`)
        setTaskDescription('')
        alert(`Agent spawned successfully! Task ID: ${data.taskId}`)
        
        // Refresh agents list
        fetchAgents()
      } else {
        alert('Failed to spawn agent')
      }
    } catch (error) {
      console.error('Failed to spawn agent:', error)
      alert('Failed to spawn agent')
    } finally {
      setIsSpawning(false)
    }
  }

  const formatLastRun = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    
    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    return `${Math.floor(diffMins / 60)}h ago`
  }

  return (
    <Card glow="gold">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Sub-Agent Spawner</h2>
        <span className="text-xs text-amber-400">Codex Ready</span>
      </div>
      
      {/* Agent Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-400 mb-2">
          Select Agent
        </label>
        <div className="grid grid-cols-2 gap-2">
          {agents.map(agent => (
            <button
              key={agent.id}
              onClick={() => setSelectedAgent(agent.id)}
              className={`p-3 rounded-lg text-left transition-colors ${
                selectedAgent === agent.id 
                  ? 'bg-amber-500/20 border border-amber-500/50' 
                  : 'bg-slate-800/30 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <StatusDot status={agent.status} />
                <span className="font-medium text-white">{agent.name}</span>
              </div>
              <p className="text-xs text-slate-400">{agent.description}</p>
              <div className="text-xs text-slate-500 mt-2">
                {agent.tasksCompleted} tasks • {formatLastRun(agent.lastRun)}
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Task Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-400 mb-2">
          Task Description
        </label>
        <textarea
          value={taskDescription}
          onChange={(e) => setTaskDescription(e.target.value)}
          placeholder="Describe what you want the agent to do..."
          className="w-full p-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
          rows={3}
        />
      </div>
      
      {/* Spawn Button */}
      <button
        onClick={spawnAgent}
        disabled={isSpawning || !taskDescription.trim()}
        className={`w-full py-3 rounded-lg font-medium transition-colors ${
          isSpawning || !taskDescription.trim()
            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white'
        }`}
      >
        {isSpawning ? 'Spawning Agent...' : `🚀 Spawn ${selectedAgent.toUpperCase()} Agent`}
      </button>
      
      {/* Last Spawned */}
      {lastSpawned && (
        <div className="mt-4 p-3 bg-slate-800/30 rounded-lg">
          <div className="text-sm text-slate-400 mb-1">Last spawned:</div>
          <div className="text-sm text-amber-300 font-mono">{lastSpawned}</div>
        </div>
      )}
      
      {/* Agent Stats */}
      <div className="mt-4 pt-4 border-t border-slate-800">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Total Agents: {agents.length}</span>
          <div className="flex items-center gap-4">
            <span className="text-green-400">
              Ready: {agents.filter(a => a.status === 'ready').length}
            </span>
            <span className="text-amber-400">
              Active: {agents.filter(a => a.status === 'active').length}
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}