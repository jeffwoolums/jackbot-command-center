import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID
const CF_EMAIL = process.env.CF_EMAIL
const CF_API_KEY = process.env.CF_API_KEY
const R2_BUCKET = process.env.LESSONCRAFT_R2_BUCKET || 'lessoncraft-audio'

function getAuthHeaders(range: string | null, email: string, apiKey: string): HeadersInit {
  const headers: Record<string, string> = {
    'X-Auth-Email': email,
    'X-Auth-Key': apiKey,
  }

  if (range) {
    headers.Range = range
  }

  return headers
}

function safeFilename(path: string): string {
  const filename = path.split('/').filter(Boolean).pop() || 'lessoncraft-asset'
  return filename.replace(/"/g, '')
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const key = url.searchParams.get('key')
    const download = url.searchParams.get('download') === '1'

    if (!key) {
      return NextResponse.json({ error: 'Missing key query parameter' }, { status: 400 })
    }

    if (!CF_ACCOUNT_ID || !CF_EMAIL || !CF_API_KEY) {
      return NextResponse.json({ error: 'Cloudflare credentials are not configured' }, { status: 500 })
    }

    const encodedKey = encodeURIComponent(key)
    const endpoint = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/r2/buckets/${R2_BUCKET}/objects/${encodedKey}`

    const upstream = await fetch(endpoint, {
      method: 'GET',
      headers: getAuthHeaders(req.headers.get('range'), CF_EMAIL, CF_API_KEY),
      cache: 'no-store',
    })

    if (!upstream.ok || !upstream.body) {
      const text = await upstream.text().catch(() => '')
      return NextResponse.json(
        {
          error: 'Failed to fetch object from R2',
          status: upstream.status,
          details: text,
        },
        { status: upstream.status || 500 }
      )
    }

    const headers = new Headers()
    const passthroughHeaders = [
      'content-type',
      'content-length',
      'accept-ranges',
      'etag',
      'last-modified',
      'cache-control',
      'content-range',
    ]

    for (const name of passthroughHeaders) {
      const value = upstream.headers.get(name)
      if (value) {
        headers.set(name, value)
      }
    }

    headers.set('content-disposition', `${download ? 'attachment' : 'inline'}; filename="${safeFilename(key)}"`)

    return new Response(upstream.body, {
      status: upstream.status,
      headers,
    })
  } catch (error) {
    console.error('LessonCraft object proxy error:', error)
    return NextResponse.json(
      {
        error: 'Unexpected proxy error',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
