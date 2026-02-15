import { NextResponse } from 'next/server'
import { loadApprovals, saveApprovals } from '../../store'

export const dynamic = 'force-dynamic'

export async function PUT(_req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const items = await loadApprovals()
  const idx = items.findIndex(i => i.id === id)

  if (idx === -1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (items[idx].status !== 'pending') {
    return NextResponse.json({ error: 'Item already reviewed', item: items[idx] }, { status: 409 })
  }

  items[idx] = {
    ...items[idx],
    status: 'rejected',
    reviewedAt: new Date().toISOString()
  }

  await saveApprovals(items)
  return NextResponse.json({ success: true, item: items[idx] })
}
