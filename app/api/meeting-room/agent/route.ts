import { NextResponse } from 'next/server'
import { appendAgentResponse, appendBackchannelMessage } from '@/lib/meeting-room/store'
import { getAgentApiKey, validateInviteToken } from '@/lib/meeting-room/auth'

export const dynamic = 'force-dynamic'

type AgentEventType = 'AgentResponse' | 'BackchannelMessage'

function getBearerValue(req: Request) {
  const auth = req.headers.get('authorization') || ''
  if (!auth.toLowerCase().startsWith('bearer ')) {
    return ''
  }

  return auth.slice(7).trim()
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const bearerValue = getBearerValue(req)
    const tokenCandidate = typeof body?.token === 'string' && body.token.trim()
      ? body.token.trim()
      : bearerValue

    let authMode: 'agentToken' | 'agentKey' | null = null
    let tokenMeetingId = ''

    if (tokenCandidate) {
      const tokenResult = validateInviteToken(tokenCandidate)
      if (tokenResult.valid && tokenResult.payload.role === 'agent') {
        authMode = 'agentToken'
        tokenMeetingId = tokenResult.payload.meetingId
      }
    }

    if (!authMode) {
      const apiKeyCandidate =
        (typeof body?.apiKey === 'string' && body.apiKey.trim() ? body.apiKey.trim() : '') ||
        req.headers.get('x-agent-key') ||
        bearerValue
      const expectedApiKey = getAgentApiKey()

      if (expectedApiKey && apiKeyCandidate === expectedApiKey) {
        authMode = 'agentKey'
      }
    }

    if (!authMode) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized. Provide valid agent token or MEETING_ROOM_AGENT_KEY.' },
        { status: 401 }
      )
    }

    const bodyMeetingId = typeof body?.meetingId === 'string' && body.meetingId.trim() ? body.meetingId.trim() : ''
    const meetingId = tokenMeetingId || bodyMeetingId

    if (!meetingId) {
      return NextResponse.json({ ok: false, error: 'meetingId is required' }, { status: 400 })
    }

    if (tokenMeetingId && bodyMeetingId && tokenMeetingId !== bodyMeetingId) {
      return NextResponse.json({ ok: false, error: 'meetingId does not match token scope' }, { status: 403 })
    }

    const type = body?.type as AgentEventType
    const payload = body?.payload || {}

    if (type === 'AgentResponse') {
      const saved = await appendAgentResponse(meetingId, {
        questionId: String(payload?.questionId || 'jarvis-direct'),
        agentId: payload?.agentId === 'jackbot' ? 'jackbot' : 'jarvis',
        responseText: String(payload?.responseText || payload?.message || ''),
        confidence: typeof payload?.confidence === 'number' ? payload.confidence : undefined,
        latencyMs: typeof payload?.latencyMs === 'number' ? payload.latencyMs : undefined,
        ttsEligible: payload?.ttsEligible === true,
      })

      return NextResponse.json({ ok: true, authMode, meetingId, event: saved })
    }

    if (type === 'BackchannelMessage') {
      const saved = await appendBackchannelMessage(meetingId, {
        from: payload?.from === 'jackbot' ? 'jackbot' : payload?.from === 'system' ? 'system' : 'jarvis',
        to: payload?.to === 'jackbot' || payload?.to === 'jarvis' ? payload.to : 'both',
        message: String(payload?.message || payload?.responseText || ''),
        severity: payload?.severity === 'warning' || payload?.severity === 'urgent' ? payload.severity : 'info',
        relatedQuestionId: typeof payload?.relatedQuestionId === 'string' ? payload.relatedQuestionId : undefined,
      })

      return NextResponse.json({ ok: true, authMode, meetingId, event: saved })
    }

    return NextResponse.json(
      { ok: false, error: 'Unsupported type. Use AgentResponse or BackchannelMessage.' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Failed to post agent meeting room event:', error)
    return NextResponse.json({ ok: false, error: 'Failed to post agent event' }, { status: 500 })
  }
}
