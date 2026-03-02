import { NextResponse } from 'next/server'
import {
  buildMeetingBaseUrl,
  buildMeetingInviteLink,
  createInviteToken,
  formatExpiry,
  generateMeetingId,
  type MeetingRole,
} from '@/lib/meeting-room/auth'

export const dynamic = 'force-dynamic'

function normalizeRole(value: unknown): MeetingRole {
  if (value === 'host' || value === 'agent') {
    return value
  }

  return 'participant'
}

function defaultDisplayName(role: MeetingRole) {
  if (role === 'host') return 'Host'
  if (role === 'agent') return 'Agent'
  return 'Participant'
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const role = normalizeRole(body?.role)
    const meetingId = typeof body?.meetingId === 'string' && body.meetingId.trim()
      ? body.meetingId.trim()
      : generateMeetingId()
    const displayName = typeof body?.displayName === 'string' && body.displayName.trim()
      ? body.displayName.trim()
      : defaultDisplayName(role)
    const ttlMinutes = typeof body?.ttlMinutes === 'number' && body.ttlMinutes > 0 ? body.ttlMinutes : 120

    const { token, payload } = createInviteToken({
      meetingId,
      role,
      displayName,
      ttlSeconds: ttlMinutes * 60,
    })

    const baseUrl = buildMeetingBaseUrl(req)
    const inviteUrl = buildMeetingInviteLink(baseUrl, token)

    return NextResponse.json({
      ok: true,
      invite: {
        meetingId,
        role,
        displayName,
        token,
        inviteUrl,
        expiresAt: formatExpiry(payload.exp),
      },
    })
  } catch (error) {
    console.error('Failed to create meeting invite:', error)
    return NextResponse.json({ ok: false, error: 'Failed to create meeting invite' }, { status: 500 })
  }
}
