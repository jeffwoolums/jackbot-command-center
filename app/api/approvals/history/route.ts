import { NextResponse } from 'next/server'
import { loadApprovals } from '../store'

export const dynamic = 'force-dynamic'

export async function GET() {
  const items = await loadApprovals()
  const history = items
    .filter(i => i.status !== 'pending')
    .sort((a, b) => (b.reviewedAt || '').localeCompare(a.reviewedAt || ''))

  return NextResponse.json({ items: history, count: history.length })
}
