'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { StatusDot } from '@/components/ui/StatusDot'

interface VoiceSystem {
  id: string
  name: string
  status: 'ready' | 'idle' | 'active' | 'building' | 'online' | 'offline'
  engine: string
  cost: string
  voices: number
  lastUsed: string
  location: string
}

interface VoiceClone {
  id: string
  name: string
  agent: string
  status: 'ready' | 'idle' | 'active' | 'building' | 'training' | 'failed'
  quality: number
  samples: number
  lastTested: string
}

export function VoiceStatus() {
  const [systems, setSystems] = useState<VoiceSystem[]>([
    {
      id: 'xtts',
      name: 'Coqui XTTS v2',
      status: 'online',
      engine: 'Local (XTTS v2)',
      cost: 'FREE',
      voices: 3,
      lastUsed: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      location: '~/developer/javabean/tts/'
    },
    {
      id: 'openai',
      name: 'OpenAI TTS',
      status: 'online',
      engine: 'Cloud (tts-1-hd)',
      cost: '$30/1M chars',
      voices: 6,
      lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      location: 'Cloud'
    },
    {
      id: 'elevenlabs',
      name: 'ElevenLabs',
      status: 'idle',
      engine: 'Cloud (sag)',
      cost: '$22/mo',
      voices: 1,
      lastUsed: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      location: 'Cloud'
    }
  ])

  const [clones, setClones] = useState<VoiceClone[]>([
    {
      id: 'jackbot',
      name: 'Jackbot',
      agent: 'The brain',
      status: 'ready',
      quality: 92,
      samples: 45,
      lastTested: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'codex',
      name: 'Codex',
      agent: 'The muscle',
      status: 'ready',
      quality: 88,
      samples: 38,
      lastTested: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'kimi',
      name: 'KIMI',
      agent: 'The lady',
      status: 'training',
      quality: 65,
      samples: 22,
      lastTested: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
    }
  ])

  const [selectedSystem, setSelectedSystem] = useState('xtts')

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    
    if (diffHours < 1) return 'just now'
    if (diffHours < 24) return `${diffHours}h ago`
    return `${Math.floor(diffHours / 24)}d ago`
  }

  const testVoice = (cloneId: string) => {
    alert(`Testing voice clone: ${cloneId}\n\nThis would play a sample in production.`)
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Voice/TTS System</h2>
        <span className="text-xs text-green-400">Online</span>
      </div>
      
      {/* TTS Systems */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-slate-400 mb-3">TTS Engines</h3>
        <div className="space-y-2">
          {systems.map(system => (
            <div 
              key={system.id}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                selectedSystem === system.id
                  ? 'bg-slate-800/50 border border-slate-700'
                  : 'bg-slate-800/30 hover:bg-slate-800/50'
              }`}
              onClick={() => setSelectedSystem(system.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <StatusDot status={system.status} />
                  <div>
                    <div className="font-medium text-white">{system.name}</div>
                    <div className="text-xs text-slate-400">{system.engine}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${
                    system.status === 'online' ? 'text-green-400' :
                    system.status === 'idle' ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {system.cost}
                  </div>
                  <div className="text-xs text-slate-400">
                    {system.voices} voices
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Voice Clones */}
      <div>
        <h3 className="text-sm font-medium text-slate-400 mb-3">Voice Clones</h3>
        <div className="space-y-3">
          {clones.map(clone => (
            <div 
              key={clone.id}
              className="p-3 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <StatusDot status={clone.status} />
                  <div>
                    <div className="font-medium text-white">{clone.name}</div>
                    <div className="text-xs text-slate-400">{clone.agent}</div>
                  </div>
                </div>
                <button
                  onClick={() => testVoice(clone.id)}
                  className="px-3 py-1 text-xs bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30 transition-colors"
                >
                  Test
                </button>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="text-slate-400">Quality</div>
                    <div className="text-white font-medium">{clone.quality}%</div>
                  </div>
                  <div>
                    <div className="text-slate-400">Samples</div>
                    <div className="text-white font-medium">{clone.samples}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-slate-400">Last tested</div>
                  <div className="text-white font-medium">{formatTime(clone.lastTested)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Stats */}
      <div className="mt-4 pt-4 border-t border-slate-800">
        <div className="flex items-center justify-between text-sm">
          <div>
            <span className="text-slate-400">Total Clones: </span>
            <span className="text-white">{clones.length}</span>
          </div>
          <div className="flex items-center gap-4">
            <div>
              <span className="text-slate-400">Ready: </span>
              <span className="text-green-400">
                {clones.filter(c => c.status === 'ready').length}
              </span>
            </div>
            <div>
              <span className="text-slate-400">Avg Quality: </span>
              <span className="text-amber-400">
                {Math.round(clones.reduce((sum, c) => sum + c.quality, 0) / clones.length)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}