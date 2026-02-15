import { NextRequest, NextResponse } from 'next/server'
import { createApprovalId, loadApprovals, makePreview, saveApprovals, type ApprovalItem } from './store'

export const dynamic = 'force-dynamic'

export async function GET() {
  const items = await loadApprovals()
  const pending = items
    .filter(i => i.status === 'pending')
    .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))

  return NextResponse.json({ items: pending, count: pending.length })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const type = typeof body?.type === 'string' ? body.type.trim() : 'post'
    const source = typeof body?.source === 'string' ? body.source.trim() : 'unknown'
    const content = body?.content ?? body?.text ?? ''

    if (!type) {
      return NextResponse.json({ error: 'Missing type' }, { status: 400 })
    }

    if (!source) {
      return NextResponse.json({ error: 'Missing source' }, { status: 400 })
    }

    if (content === undefined || content === null || (typeof content === 'string' && !content.trim())) {
      return NextResponse.json({ error: 'Missing content' }, { status: 400 })
    }

    const items = await loadApprovals()

    const newItem: ApprovalItem = {
      id: createApprovalId(),
      type,
      content,
      preview: makePreview(content, body?.preview),
      source,
      createdAt: new Date().toISOString(),
      status: 'pending',
      reviewedAt: null
    }

    items.push(newItem)
    await saveApprovals(items)

    return NextResponse.json({ success: true, item: newItem })
  } catch (error) {
    console.error('Failed to add approval item:', error)
    return NextResponse.json({ error: 'Failed to add approval item' }, { status: 500 })
  }
}
