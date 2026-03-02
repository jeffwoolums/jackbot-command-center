import { NextResponse } from 'next/server'
import { formatExpiry, validateInviteToken } from '@/lib/meeting-room/auth'

export const dynamic = 'force-dynamic'

function tokenResponse(token: string) {
  const result = validateInviteToken(token)

  if (!result.valid) {
    return NextResponse.json(
      {
        ok: false,
        valid: false,
        error: result.error,
      },
      { status: 401 }
    )
  }

  return NextResponse.json({
    ok: true,
    valid: true,
    session: {
      meetingId: result.payload.meetingId,
      role: result.payload.role,
      displayName: result.payload.displayName,
      expiresAt: formatExpiry(result.payload.exp),
      issuedAt: formatExpiry(result.payload.iat),
    },
  })
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const token = url.searchParams.get('token') || ''
  return tokenResponse(token)
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const token = typeof body?.token === 'string' ? body.token : ''
  return tokenResponse(token)
}
