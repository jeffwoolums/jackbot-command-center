'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import type { MeetingRoomState } from '@/lib/meeting-room/types'

const DEFAULT_MEETING_ID = 'agent-room-mvp'
const DEFAULT_JITSI_URL = 'https://meet.jit.si/JackbotJarvisMeetingRoomMVP'

type ControlKey = 'humanOnlyMode' | 'allowAgentAudio' | 'autoNotes'
type InviteKey = 'jeff' | 'tyler' | 'jarvis'

interface InviteDetails {
  role: 'host' | 'participant' | 'agent'
  displayName: string
  token: string
  inviteUrl: string
  expiresAt: string
}

interface SessionBundle {
  meetingId: string
  roomName: string
  roomUrl: string
  agentWebhookUrl: string
  inviteLinks: Record<InviteKey, InviteDetails>
}

interface ViewerSessionContext {
  meetingId: string
  role: 'host' | 'participant' | 'agent'
  displayName: string
  expiresAt: string
  issuedAt: string
}

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

  const [sessionBundle, setSessionBundle] = useState<SessionBundle | null>(null)
  const [creatingSession, setCreatingSession] = useState(false)
  const [inviteLoading, setInviteLoading] = useState<InviteKey | null>(null)
  const [copyLabel, setCopyLabel] = useState('')
  const [viewerSession, setViewerSession] = useState<ViewerSessionContext | null>(null)
  const [sessionError, setSessionError] = useState('')

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

  useEffect(() => {
    const initSessionFromToken = async () => {
      if (typeof window === 'undefined') return

      const token = new URLSearchParams(window.location.search).get('token')
      if (!token) return

      try {
        const res = await fetch(`/api/meeting-room/validate?token=${encodeURIComponent(token)}`)
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}))
          setSessionError(typeof errorData?.error === 'string' ? errorData.error : 'Invite validation failed')
          return
        }

        const data = await res.json()
        if (data?.session) {
          const session = data.session as ViewerSessionContext
          setViewerSession(session)
          setMeetingId(session.meetingId)
          setSessionError('')
        }
      } catch (error) {
        console.error('Failed to validate meeting token:', error)
        setSessionError('Invite validation failed')
      }
    }

    initSessionFromToken()
  }, [])

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

  const createSession = async () => {
    setCreatingSession(true)
    setSessionError('')

    try {
      const res = await fetch('/api/meeting-room/bootstrap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        setSessionError(typeof errorData?.error === 'string' ? errorData.error : 'Failed to create session')
        return
      }

      const data = await res.json()
      if (data?.session) {
        const nextSession = data.session as SessionBundle
        setSessionBundle(nextSession)
        setMeetingId(nextSession.meetingId)
        setRoomUrl(nextSession.roomUrl)
      }
    } catch (error) {
      console.error('Failed to bootstrap meeting session:', error)
      setSessionError('Failed to create session')
    } finally {
      setCreatingSession(false)
    }
  }

  const createInvite = async (slot: InviteKey, role: InviteDetails['role'], displayName: string) => {
    setInviteLoading(slot)
    setSessionError('')

    try {
      const res = await fetch('/api/meeting-room/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meetingId,
          role,
          displayName,
          ttlMinutes: 120,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        setSessionError(typeof errorData?.error === 'string' ? errorData.error : 'Failed to create invite')
        return
      }

      const data = await res.json()
      const invite = data?.invite as InviteDetails | undefined
      if (!invite) return

      setSessionBundle((prev) => {
        if (!prev) {
          return {
            meetingId,
            roomName: 'manual-room',
            roomUrl,
            agentWebhookUrl: `${window.location.origin}/api/meeting-room/agent`,
            inviteLinks: {
              jeff: slot === 'jeff' ? invite : createPlaceholderInvite('Jeff', 'host'),
              tyler: slot === 'tyler' ? invite : createPlaceholderInvite('Tyler', 'participant'),
              jarvis: slot === 'jarvis' ? invite : createPlaceholderInvite('Jarvis', 'agent'),
            },
          }
        }

        return {
          ...prev,
          inviteLinks: {
            ...prev.inviteLinks,
            [slot]: invite,
          },
        }
      })
    } catch (error) {
      console.error('Failed to create invite:', error)
      setSessionError('Failed to create invite')
    } finally {
      setInviteLoading(null)
    }
  }

  const copyText = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopyLabel(`${label} copied`)
      setTimeout(() => setCopyLabel(''), 1500)
    } catch {
      setCopyLabel('Clipboard unavailable')
      setTimeout(() => setCopyLabel(''), 1500)
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

          {viewerSession && (
            <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
              Authenticated as <span className="font-semibold">{viewerSession.displayName}</span> ({viewerSession.role}) • invite expires {new Date(viewerSession.expiresAt).toLocaleString()}
            </div>
          )}

          {sessionError && (
            <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
              {sessionError}
            </div>
          )}

          {copyLabel && (
            <div className="rounded-lg border border-sky-500/40 bg-sky-500/10 px-3 py-2 text-sm text-sky-200">
              {copyLabel}
            </div>
          )}
        </section>

        <section className="p-4 bg-slate-900 rounded-lg border border-indigo-500/30 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-indigo-300">🔐 Create Session</h2>
              <p className="text-sm text-slate-400">Generate secure invite links for Jeff, Tyler, and Jarvis using short-lived signed tokens.</p>
            </div>
            <button
              onClick={createSession}
              disabled={creatingSession}
              className="bg-indigo-500/20 border border-indigo-400/40 text-indigo-200 hover:bg-indigo-500/30 disabled:opacity-50 rounded-lg px-4 py-2 text-sm font-semibold"
            >
              {creatingSession ? 'Creating…' : 'Create New Session + Invites'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={() => createInvite('jeff', 'host', 'Jeff')}
              disabled={inviteLoading !== null}
              className="bg-slate-800 border border-slate-700 hover:border-amber-500/50 rounded-lg px-3 py-2 text-sm text-left"
            >
              {inviteLoading === 'jeff' ? 'Generating…' : 'Generate Jeff host invite'}
            </button>
            <button
              onClick={() => createInvite('tyler', 'participant', 'Tyler')}
              disabled={inviteLoading !== null}
              className="bg-slate-800 border border-slate-700 hover:border-amber-500/50 rounded-lg px-3 py-2 text-sm text-left"
            >
              {inviteLoading === 'tyler' ? 'Generating…' : 'Generate Tyler participant invite'}
            </button>
            <button
              onClick={() => createInvite('jarvis', 'agent', 'Jarvis')}
              disabled={inviteLoading !== null}
              className="bg-slate-800 border border-slate-700 hover:border-amber-500/50 rounded-lg px-3 py-2 text-sm text-left"
            >
              {inviteLoading === 'jarvis' ? 'Generating…' : 'Generate Jarvis agent invite'}
            </button>
          </div>

          {sessionBundle && (
            <div className="space-y-3">
              <div className="rounded-lg bg-slate-800 border border-slate-700 p-3 text-sm space-y-1">
                <div>Meeting ID: <span className="font-mono text-amber-300">{sessionBundle.meetingId}</span></div>
                <div>Jitsi Room: <span className="font-mono text-slate-300">{sessionBundle.roomUrl}</span></div>
                <div>Room Name: <span className="font-mono text-slate-300">{sessionBundle.roomName}</span></div>
              </div>

              <CopyRow label="Jeff Invite" value={sessionBundle.inviteLinks.jeff.inviteUrl} onCopy={copyText} />
              <CopyRow label="Tyler Invite" value={sessionBundle.inviteLinks.tyler.inviteUrl} onCopy={copyText} />
              <CopyRow label="Jarvis Invite" value={sessionBundle.inviteLinks.jarvis.inviteUrl} onCopy={copyText} />
              <CopyRow label="Jarvis Agent Token" value={sessionBundle.inviteLinks.jarvis.token} onCopy={copyText} />
              <CopyRow label="Jarvis Agent Webhook" value={sessionBundle.agentWebhookUrl} onCopy={copyText} />
            </div>
          )}
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

function createPlaceholderInvite(displayName: string, role: InviteDetails['role']): InviteDetails {
  return {
    role,
    displayName,
    token: 'Generate invite to create token',
    inviteUrl: 'Generate invite to create URL',
    expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
  }
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

interface CopyRowProps {
  label: string
  value: string
  onCopy: (label: string, value: string) => Promise<void>
}

function CopyRow({ label, value, onCopy }: CopyRowProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[180px_1fr_auto] gap-2 items-center">
      <div className="text-sm text-slate-300">{label}</div>
      <input
        type="text"
        value={value}
        readOnly
        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200"
      />
      <button
        onClick={() => onCopy(label, value)}
        className="bg-slate-800 border border-slate-600 hover:border-amber-500/50 rounded-lg px-3 py-2 text-xs"
      >
        Copy
      </button>
    </div>
  )
}
