import { NextResponse } from 'next/server'
import {
  appendActionItem,
  appendAgentQuestion,
  appendAgentResponse,
  appendBackchannelMessage,
  appendTranscriptChunk,
  getMeetingRoomState,
} from '@/lib/meeting-room/store'

export const dynamic = 'force-dynamic'

type EventType =
  | 'TranscriptChunk'
  | 'AgentQuestion'
  | 'AgentResponse'
  | 'ActionItem'
  | 'BackchannelMessage'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const meetingId = url.searchParams.get('meetingId') || 'agent-room-mvp'
    const state = await getMeetingRoomState(meetingId)

    return NextResponse.json({ meetingId, state })
  } catch (error) {
    console.error('Failed to load meeting room state:', error)
    return NextResponse.json({ error: 'Failed to load meeting room state' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const meetingId = typeof body?.meetingId === 'string' && body.meetingId.trim()
      ? body.meetingId.trim()
      : 'agent-room-mvp'

    const type = body?.type as EventType
    const payload = body?.payload || {}

    switch (type) {
      case 'TranscriptChunk':
        await appendTranscriptChunk(meetingId, {
          speaker: String(payload?.speaker || 'Unknown speaker'),
          source: payload?.source === 'agent' || payload?.source === 'system' ? payload.source : 'human',
          text: String(payload?.text || ''),
          startedAt: String(payload?.startedAt || new Date().toISOString()),
          endedAt: String(payload?.endedAt || new Date().toISOString()),
          confidence: typeof payload?.confidence === 'number' ? payload.confidence : undefined,
          isFinal: payload?.isFinal !== false,
        })
        break

      case 'AgentQuestion':
        await appendAgentQuestion(meetingId, {
          askedBy: String(payload?.askedBy || 'Jeff'),
          question: String(payload?.question || ''),
          targetAgent: payload?.targetAgent === 'jackbot' || payload?.targetAgent === 'jarvis' ? payload.targetAgent : 'both',
          contextChunkIds: Array.isArray(payload?.contextChunkIds)
            ? payload.contextChunkIds.map((id: unknown) => String(id))
            : [],
        })
        break

      case 'AgentResponse':
        await appendAgentResponse(meetingId, {
          questionId: String(payload?.questionId || 'unknown-question'),
          agentId: payload?.agentId === 'jarvis' ? 'jarvis' : 'jackbot',
          responseText: String(payload?.responseText || ''),
          confidence: typeof payload?.confidence === 'number' ? payload.confidence : undefined,
          latencyMs: typeof payload?.latencyMs === 'number' ? payload.latencyMs : undefined,
          ttsEligible: payload?.ttsEligible !== false,
        })
        break

      case 'ActionItem':
        await appendActionItem(meetingId, {
          text: String(payload?.text || ''),
          owner: String(payload?.owner || 'Jeff'),
          dueAt: typeof payload?.dueAt === 'string' ? payload.dueAt : undefined,
          status: payload?.status === 'in_progress' || payload?.status === 'done' ? payload.status : 'open',
          sourceChunkIds: Array.isArray(payload?.sourceChunkIds)
            ? payload.sourceChunkIds.map((id: unknown) => String(id))
            : [],
        })
        break

      case 'BackchannelMessage':
        await appendBackchannelMessage(meetingId, {
          from: payload?.from === 'jarvis' ? 'jarvis' : payload?.from === 'system' ? 'system' : 'jackbot',
          to: payload?.to === 'jackbot' || payload?.to === 'jarvis' ? payload.to : 'both',
          message: String(payload?.message || ''),
          severity: payload?.severity === 'warning' || payload?.severity === 'urgent' ? payload.severity : 'info',
          relatedQuestionId: typeof payload?.relatedQuestionId === 'string' ? payload.relatedQuestionId : undefined,
        })
        break

      default:
        return NextResponse.json({ error: 'Unknown event type' }, { status: 400 })
    }

    const state = await getMeetingRoomState(meetingId)
    return NextResponse.json({ ok: true, meetingId, state })
  } catch (error) {
    console.error('Failed to append meeting room event:', error)
    return NextResponse.json({ error: 'Failed to append event' }, { status: 500 })
  }
}
