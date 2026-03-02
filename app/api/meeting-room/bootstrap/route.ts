import { NextResponse } from 'next/server'
import {
  buildMeetingBaseUrl,
  buildMeetingInviteLink,
  createInviteToken,
  formatExpiry,
  generateJitsiRoomName,
  generateMeetingId,
  type MeetingRole,
} from '@/lib/meeting-room/auth'

export const dynamic = 'force-dynamic'

function createInvite(meetingId: string, role: MeetingRole, displayName: string, ttlMinutes: number, baseUrl: string) {
  const { token, payload } = createInviteToken({
    meetingId,
    role,
    displayName,
    ttlSeconds: ttlMinutes * 60,
  })

  return {
    role,
    displayName,
    token,
    inviteUrl: buildMeetingInviteLink(baseUrl, token),
    expiresAt: formatExpiry(payload.exp),
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const baseUrl = buildMeetingBaseUrl(req)
    const meetingId = typeof body?.meetingId === 'string' && body.meetingId.trim()
      ? body.meetingId.trim()
      : generateMeetingId()
    const ttlMinutes = typeof body?.ttlMinutes === 'number' && body.ttlMinutes > 0 ? body.ttlMinutes : 120

    const roomName = generateJitsiRoomName()
    const jitsiBase = typeof body?.jitsiBaseUrl === 'string' && body.jitsiBaseUrl.trim()
      ? body.jitsiBaseUrl.trim().replace(/\/$/, '')
      : 'https://meet.jit.si'

    const roomUrl = `${jitsiBase}/${roomName}`

    const jeffInvite = createInvite(meetingId, 'host', 'Jeff', ttlMinutes, baseUrl)
    const tylerInvite = createInvite(meetingId, 'participant', 'Tyler', ttlMinutes, baseUrl)
    const jarvisInvite = createInvite(meetingId, 'agent', 'Jarvis', ttlMinutes, baseUrl)

    return NextResponse.json({
      ok: true,
      session: {
        meetingId,
        roomName,
        roomUrl,
        agentWebhookUrl: `${baseUrl}/api/meeting-room/agent`,
        inviteLinks: {
          jeff: jeffInvite,
          tyler: tylerInvite,
          jarvis: jarvisInvite,
        },
      },
    })
  } catch (error) {
    console.error('Failed to bootstrap meeting room:', error)
    return NextResponse.json({ ok: false, error: 'Failed to bootstrap meeting room' }, { status: 500 })
  }
}
