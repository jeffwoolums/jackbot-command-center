import { createHmac, randomBytes, timingSafeEqual } from 'crypto'

export type MeetingRole = 'host' | 'participant' | 'agent'

export interface MeetingInviteTokenPayload {
  meetingId: string
  role: MeetingRole
  displayName: string
  exp: number
  iat: number
}

const DEFAULT_SIGNING_SECRET = 'local-dev-meeting-room-secret-change-me'

function base64UrlEncode(value: string) {
  return Buffer.from(value, 'utf8').toString('base64url')
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, 'base64url').toString('utf8')
}

function sign(payloadB64: string, secret: string) {
  return createHmac('sha256', secret).update(payloadB64).digest('base64url')
}

function safeEqual(a: string, b: string) {
  const aBuffer = Buffer.from(a)
  const bBuffer = Buffer.from(b)

  if (aBuffer.length !== bBuffer.length) {
    return false
  }

  return timingSafeEqual(aBuffer, bBuffer)
}

export function getMeetingSigningSecret() {
  return process.env.MEETING_ROOM_SIGNING_SECRET?.trim() || DEFAULT_SIGNING_SECRET
}

export function buildMeetingBaseUrl(req?: Request) {
  const fromEnv = process.env.NEXT_PUBLIC_MEETING_BASE_URL?.trim()
  if (fromEnv) {
    return fromEnv.replace(/\/$/, '')
  }

  if (req) {
    const url = new URL(req.url)
    return `${url.protocol}//${url.host}`
  }

  return 'http://localhost:3333'
}

export function createInviteToken(input: {
  meetingId: string
  role: MeetingRole
  displayName: string
  ttlSeconds?: number
}) {
  const now = Math.floor(Date.now() / 1000)
  const ttlSeconds = input.ttlSeconds && input.ttlSeconds > 0 ? input.ttlSeconds : 60 * 60
  const payload: MeetingInviteTokenPayload = {
    meetingId: input.meetingId,
    role: input.role,
    displayName: input.displayName,
    iat: now,
    exp: now + ttlSeconds,
  }

  const payloadB64 = base64UrlEncode(JSON.stringify(payload))
  const signatureB64 = sign(payloadB64, getMeetingSigningSecret())

  return {
    token: `${payloadB64}.${signatureB64}`,
    payload,
  }
}

export function validateInviteToken(token: string) {
  if (!token || !token.includes('.')) {
    return { valid: false as const, error: 'Malformed token' }
  }

  const [payloadB64, signatureB64] = token.split('.')
  if (!payloadB64 || !signatureB64) {
    return { valid: false as const, error: 'Malformed token' }
  }

  const expectedSignature = sign(payloadB64, getMeetingSigningSecret())
  if (!safeEqual(signatureB64, expectedSignature)) {
    return { valid: false as const, error: 'Invalid signature' }
  }

  try {
    const payload = JSON.parse(base64UrlDecode(payloadB64)) as MeetingInviteTokenPayload

    const validRole = payload?.role === 'host' || payload?.role === 'participant' || payload?.role === 'agent'

    if (
      !payload?.meetingId ||
      typeof payload.meetingId !== 'string' ||
      !payload?.displayName ||
      typeof payload.displayName !== 'string' ||
      !validRole ||
      typeof payload?.exp !== 'number'
    ) {
      return { valid: false as const, error: 'Invalid payload' }
    }

    if (payload.exp <= Math.floor(Date.now() / 1000)) {
      return { valid: false as const, error: 'Token expired' }
    }

    return { valid: true as const, payload }
  } catch {
    return { valid: false as const, error: 'Invalid payload encoding' }
  }
}

export function buildMeetingInviteLink(baseUrl: string, token: string) {
  const cleanBase = baseUrl.replace(/\/$/, '')
  return `${cleanBase}/meeting-room?token=${encodeURIComponent(token)}`
}

export function generateMeetingId() {
  return `mr_${randomBytes(8).toString('hex')}`
}

export function generateJitsiRoomName() {
  return `AgentRoom-${randomBytes(10).toString('hex')}`
}

export function getAgentApiKey() {
  return process.env.MEETING_ROOM_AGENT_KEY?.trim() || ''
}

export function formatExpiry(expUnixSeconds: number) {
  return new Date(expUnixSeconds * 1000).toISOString()
}
