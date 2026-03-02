'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import type { MeetingRoomState } from '@/lib/meeting-room/types'

const DEFAULT_MEETING_ID = 'agent-room-mvp'
const DEFAULT_JITSI_URL = 'https://meet.jit.si/JackbotJarvisMeetingRoomMVP'

type ControlKey = 'humanOnlyMode' | 'allowAgentAudio' | 'autoNotes'

const emptyState: MeetingRoomState = {
  meetingId: DEFAULT_MEETING_ID,
  transcript: [],
  agentQuestions: [],
  agentResponses: [],
  actionItems: [],
  backchannel: [],
  updatedAt: new Date().toISOString(),
}

export default function MeetingRoomPage() {
  const [meetingId, setMeetingId] = useState(DEFAULT_MEETING_ID)
  const [roomUrl, setRoomUrl] = useState(DEFAULT_JITSI_URL)
  const [activeRoomUrl, setActiveRoomUrl] = useState('')
  const [controls, setControls] = useState<Record<ControlKey, boolean>>({
    humanOnlyMode: false,
    allowAgentAudio: true,
    autoNotes: true,
  })
  const [state, setState] = useState<MeetingRoomState>(emptyState)
  const [loading, setLoading] = useState(true)
  const [transcriptInput, setTranscriptInput] = useState('')
  const [actionInput, setActionInput] = useState('')
  const [actionOwner, setActionOwner] = useState('Jeff')
  const [saving, setSaving] = useState(false)

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch(`/api/meeting-room?meetingId=${encodeURIComponent(meetingId)}`, {
        cache: 'no-store',
      })

      if (!res.ok) return

      const data = await res.json()
      if (data?.state) {
        setState(data.state as MeetingRoomState)
      }
    } catch (error) {
      console.error('Failed to load meeting room state:', error)
    } finally {
      setLoading(false)
    }
  }, [meetingId])

  useEffect(() => {
    fetchState()
    const interval = setInterval(fetchState, 5000)
    return () => clearInterval(interval)
  }, [fetchState])

  const submitEvent = async (type: string, payload: Record<string, unknown>) => {
    setSaving(true)
    try {
      const res = await fetch('/api/meeting-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meetingId, type, payload }),
      })

      if (!res.ok) return

      const data = await res.json()
      if (data?.state) {
        setState(data.state as MeetingRoomState)
      }
    } catch (error) {
      console.error('Failed to submit meeting room event:', error)
    } finally {
      setSaving(false)
    }
  }

  const joinRoom = () => {
    if (!roomUrl.trim()) return
    setActiveRoomUrl(roomUrl.trim())
  }

  const handleToggle = (key: ControlKey) => {
    setControls((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const addTranscriptChunk = async () => {
    if (!transcriptInput.trim()) return

    await submitEvent('TranscriptChunk', {
      speaker: controls.humanOnlyMode ? 'Jeff' : 'Jeff / Tyler',
      source: 'human',
      text: transcriptInput.trim(),
      startedAt: new Date().toISOString(),
      endedAt: new Date().toISOString(),
      isFinal: true,
      confidence: 0.92,
    })

    if (controls.autoNotes) {
      await submitEvent('ActionItem', {
        text: `Review transcript: ${transcriptInput.trim().slice(0, 80)}`,
        owner: actionOwner,
        status: 'open',
        sourceChunkIds: [],
      })
    }

    setTranscriptInput('')
  }

  const addActionItem = async () => {
    if (!actionInput.trim()) return

    await submitEvent('ActionItem', {
      text: actionInput.trim(),
      owner: actionOwner,
      status: 'open',
      sourceChunkIds: [],
    })

    setActionInput('')
  }

  const transcriptPreview = useMemo(() => state.transcript.slice(-20).reverse(), [state.transcript])
  const actionPreview = useMemo(() => state.actionItems.slice(-20).reverse(), [state.actionItems])

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur border-b border-slate-800 px-6 py-4">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 rounded-lg hover:bg-slate-800 transition-colors">←</Link>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
                🎙️ Agent Meeting Room (MVP)
              </h1>
              <p className="text-slate-500 text-sm">Jeff + Tyler + Jackbot + Jarvis • Jitsi front-room with agent backchannel</p>
            </div>
          </div>

          <div className="text-right text-sm text-slate-400">
            <div>Meeting ID: <span className="text-amber-400 font-mono">{meetingId}</span></div>
            <div>Updated: {new Date(state.updatedAt).toLocaleTimeString()}</div>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-[1600px] mx-auto space-y-6">
        <section className="p-4 bg-slate-900 rounded-lg border border-slate-700 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-3">
            <input
              type="url"
              value={roomUrl}
              onChange={(e) => setRoomUrl(e.target.value)}
              placeholder="https://meet.jit.si/your-room"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
            <button
              onClick={joinRoom}
              className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-6 py-2.5 rounded-lg transition-colors"
            >
              Join Jitsi Room
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <ToggleChip
              label="Human-only mode"
              enabled={controls.humanOnlyMode}
              onClick={() => handleToggle('humanOnlyMode')}
            />
            <ToggleChip
              label="Allow agent audio"
              enabled={controls.allowAgentAudio}
              onClick={() => handleToggle('allowAgentAudio')}
            />
            <ToggleChip
              label="Auto-notes"
              enabled={controls.autoNotes}
              onClick={() => handleToggle('autoNotes')}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <input
              type="text"
              value={meetingId}
              onChange={(e) => setMeetingId(e.target.value || DEFAULT_MEETING_ID)}
              placeholder="Meeting ID"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
            <input
              type="text"
              value={actionOwner}
              onChange={(e) => setActionOwner(e.target.value)}
              placeholder="Default action owner (Jeff/Tyler/Jackbot/Jarvis)"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-6">
          <div className="p-4 bg-slate-900 rounded-lg border border-blue-500/30">
            <h2 className="text-lg font-bold text-blue-300 mb-3">📹 Front Room (Jitsi)</h2>
            {activeRoomUrl ? (
              <iframe
                src={activeRoomUrl}
                className="w-full h-[440px] rounded-lg border border-slate-700 bg-slate-950"
                allow="camera; microphone; fullscreen; display-capture"
              />
            ) : (
              <div className="h-[440px] rounded-lg border border-dashed border-slate-700 flex items-center justify-center text-slate-500">
                Paste Jitsi URL and click “Join Jitsi Room”
              </div>
            )}
          </div>

          <div className="p-4 bg-slate-900 rounded-lg border border-purple-500/30 space-y-4">
            <h2 className="text-lg font-bold text-purple-300">🛠️ Quick Event Input</h2>

            <div className="space-y-2">
              <label className="text-sm text-slate-400">Transcript chunk</label>
              <textarea
                value={transcriptInput}
                onChange={(e) => setTranscriptInput(e.target.value)}
                rows={4}
                placeholder="Paste a line from live transcript..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={addTranscriptChunk}
                disabled={saving || !transcriptInput.trim()}
                className="w-full bg-blue-500/20 border border-blue-500/40 text-blue-200 hover:bg-blue-500/30 disabled:opacity-50 rounded-lg py-2 text-sm font-medium"
              >
                {saving ? 'Saving…' : 'Add Transcript Chunk'}
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-400">Action item</label>
              <textarea
                value={actionInput}
                onChange={(e) => setActionInput(e.target.value)}
                rows={3}
                placeholder="Add a manual action item..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={addActionItem}
                disabled={saving || !actionInput.trim()}
                className="w-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 hover:bg-emerald-500/30 disabled:opacity-50 rounded-lg py-2 text-sm font-medium"
              >
                {saving ? 'Saving…' : 'Add Action Item'}
              </button>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="p-4 bg-slate-900 rounded-lg border border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-amber-300">📝 Transcript Panel</h3>
              <span className="text-xs text-slate-400">{state.transcript.length} chunks</span>
            </div>

            {loading ? (
              <div className="text-slate-500">Loading transcript…</div>
            ) : transcriptPreview.length === 0 ? (
              <div className="text-slate-500">No transcript events yet.</div>
            ) : (
              <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                {transcriptPreview.map((chunk) => (
                  <div key={chunk.id} className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                    <div className="text-xs text-slate-400 mb-1">
                      {chunk.speaker} • {new Date(chunk.endedAt).toLocaleTimeString()} • {chunk.source}
                    </div>
                    <div className="text-sm text-slate-100">{chunk.text}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 bg-slate-900 rounded-lg border border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-emerald-300">✅ Notes + Action Items</h3>
              <span className="text-xs text-slate-400">{state.actionItems.length} items</span>
            </div>

            {loading ? (
              <div className="text-slate-500">Loading notes…</div>
            ) : actionPreview.length === 0 ? (
              <div className="text-slate-500">No action items yet.</div>
            ) : (
              <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                {actionPreview.map((item) => (
                  <div key={item.id} className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                    <div className="text-sm text-slate-100">{item.text}</div>
                    <div className="mt-1 text-xs text-slate-400">
                      Owner: {item.owner} • Status: {item.status.replace('_', ' ')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

interface ToggleChipProps {
  label: string
  enabled: boolean
  onClick: () => void
}

function ToggleChip({ label, enabled, onClick }: ToggleChipProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-between rounded-lg px-3 py-2 border transition-colors ${
        enabled
          ? 'bg-amber-500/15 border-amber-500/40 text-amber-200'
          : 'bg-slate-800 border-slate-700 text-slate-300'
      }`}
    >
      <span className="text-sm font-medium">{label}</span>
      <span className={`text-xs px-2 py-0.5 rounded-full ${enabled ? 'bg-amber-500 text-black' : 'bg-slate-700 text-slate-300'}`}>
        {enabled ? 'ON' : 'OFF'}
      </span>
    </button>
  )
}
