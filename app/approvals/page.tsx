'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

interface ApprovalItem {
  id: string
  type: string
  content: unknown
  preview: string
  source: string
  createdAt: string
  status: 'pending' | 'approved' | 'rejected'
  reviewedAt: string | null
}

type Tab = 'pending' | 'history'

function formatDateTime(iso: string | null | undefined) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function typeColor(type: string) {
  const t = type.toLowerCase()
  if (t.includes('tweet') || t.includes('x')) return 'border-sky-500/40 bg-sky-500/10 text-sky-200'
  if (t.includes('image') || t.includes('art')) return 'border-purple-500/40 bg-purple-500/10 text-purple-200'
  if (t.includes('post') || t.includes('blog')) return 'border-amber-500/40 bg-amber-500/10 text-amber-200'
  return 'border-slate-500/40 bg-slate-500/10 text-slate-200'
}

function looksLikeImageUrl(value: unknown) {
  if (typeof value !== 'string') return false
  const v = value.toLowerCase()
  return v.startsWith('http') && (v.endsWith('.png') || v.endsWith('.jpg') || v.endsWith('.jpeg') || v.endsWith('.webp') || v.endsWith('.gif'))
}

export default function ApprovalsPage() {
  const [tab, setTab] = useState<Tab>('pending')
  const [pending, setPending] = useState<ApprovalItem[]>([])
  const [history, setHistory] = useState<ApprovalItem[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const pendingCount = pending.length
  const historyCount = history.length

  const load = useCallback(async () => {
    setError(null)
    setLoading(true)
    try {
      const [pendingRes, historyRes] = await Promise.all([
        fetch('/api/approvals', { cache: 'no-store' }),
        fetch('/api/approvals/history', { cache: 'no-store' })
      ])

      const pendingData = await pendingRes.json()
      const historyData = await historyRes.json()

      setPending(Array.isArray(pendingData?.items) ? pendingData.items : [])
      setHistory(Array.isArray(historyData?.items) ? historyData.items : [])
    } catch (e) {
      console.error('Failed to load approvals:', e)
      setError('Failed to load approvals queue')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const interval = setInterval(load, 15000)
    return () => clearInterval(interval)
  }, [load])

  const visibleItems = useMemo(() => {
    return tab === 'pending' ? pending : history
  }, [tab, pending, history])

  const review = async (id: string, action: 'approve' | 'reject') => {
    setBusyId(id)
    setError(null)
    try {
      const res = await fetch(`/api/approvals/${id}/${action}`, { method: 'PUT' })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || `Failed to ${action}`)
      }
      await load()
    } catch (e: any) {
      console.error(e)
      setError(e?.message || 'Action failed')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur border-b border-slate-800 px-6 py-4">
        <div className="flex items-center justify-between max-w-[1400px] mx-auto">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 rounded-lg hover:bg-slate-800 transition-colors">←</Link>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">✅ Approvals Queue</h1>
              <p className="text-slate-500 text-sm">Review pending items before publishing • Approve (green) or Reject (red)</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={load}
              className="px-3 py-2 rounded-md text-sm font-medium border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 transition-all"
            >
              ↻ Refresh
            </button>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-[1400px] mx-auto">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex bg-slate-900 rounded-lg p-1 w-fit">
            <button
              onClick={() => setTab('pending')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                tab === 'pending' ? 'bg-green-500 text-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setTab('history')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                tab === 'history' ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              History ({historyCount})
            </button>
          </div>

          {error && (
            <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64 text-slate-500 text-lg">Loading approvals...</div>
        ) : visibleItems.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <div className="text-4xl mb-4">🧘</div>
            <div className="text-lg">{tab === 'pending' ? 'No pending approvals' : 'No approval history yet'}</div>
            <div className="text-sm mt-2">This page updates automatically every 15 seconds.</div>
          </div>
        ) : (
          <div className="grid gap-4">
            {visibleItems.map((item) => (
              <div
                key={item.id}
                className="bg-slate-900 rounded-lg border border-slate-700 p-4 hover:border-slate-600 transition-colors"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-1 rounded-full border ${typeColor(item.type)}`}>🧾 {item.type}</span>
                      <span className="text-xs px-2 py-1 rounded-full border border-slate-700 bg-slate-800 text-slate-200">🤖 {item.source}</span>
                      {item.status !== 'pending' && (
                        <span className={`text-xs px-2 py-1 rounded-full border ${
                          item.status === 'approved'
                            ? 'border-green-500/40 bg-green-500/10 text-green-200'
                            : 'border-red-500/40 bg-red-500/10 text-red-200'
                        }`}
                        >
                          {item.status === 'approved' ? 'Approved' : 'Rejected'} • {formatDateTime(item.reviewedAt)}
                        </span>
                      )}
                    </div>

                    <div className="text-slate-400 text-xs mb-2">Created: {formatDateTime(item.createdAt)} • ID: {item.id}</div>

                    {looksLikeImageUrl(item.content) ? (
                      <div className="mt-3">
                        <img
                          src={String(item.content)}
                          alt={item.preview || 'Approval image'}
                          className="max-h-[340px] w-auto rounded-lg border border-slate-700 bg-slate-950"
                        />
                        {item.preview && (
                          <div className="mt-3 text-slate-200 text-sm whitespace-pre-wrap">{item.preview}</div>
                        )}
                      </div>
                    ) : (
                      <div className="text-slate-200 text-sm whitespace-pre-wrap">
                        {item.preview}
                      </div>
                    )}

                    <details className="mt-3">
                      <summary className="cursor-pointer text-slate-400 text-sm hover:text-slate-200">Show full content</summary>
                      <pre className="mt-2 bg-slate-950/60 border border-slate-800 rounded-lg p-3 text-xs overflow-x-auto text-slate-200 whitespace-pre-wrap">
                        {typeof item.content === 'string' ? item.content : JSON.stringify(item.content, null, 2)}
                      </pre>
                    </details>
                  </div>

                  {item.status === 'pending' && (
                    <div className="flex gap-2 md:flex-col md:items-stretch md:min-w-[160px]">
                      <button
                        onClick={() => review(item.id, 'approve')}
                        disabled={busyId === item.id}
                        className="bg-green-500 hover:bg-green-400 disabled:opacity-50 disabled:hover:bg-green-500 text-black font-bold px-4 py-2 rounded-lg transition-colors"
                      >
                        {busyId === item.id ? '⏳' : '✅ Approve'}
                      </button>
                      <button
                        onClick={() => review(item.id, 'reject')}
                        disabled={busyId === item.id}
                        className="bg-red-500 hover:bg-red-400 disabled:opacity-50 disabled:hover:bg-red-500 text-black font-bold px-4 py-2 rounded-lg transition-colors"
                      >
                        {busyId === item.id ? '⏳' : '🗑 Reject'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
