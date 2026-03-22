'use client'

import { useEffect, useState } from 'react'

interface ServerStatus {
  hostname: string
  ip: string
  status: 'online' | 'offline'
  cpu: number
  ram: number
  disk: number
}

interface InfrastructureResponse {
  servers: ServerStatus[]
}

function MetricBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-[#9ca3af]">{label}</span>
        <span className="font-medium text-white">{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-black/30">
        <div className="h-2 rounded-full bg-[#d4a853] transition-all" style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

export default function InfrastructureMonitor() {
  const [data, setData] = useState<InfrastructureResponse>({ servers: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch('/api/infrastructure', { cache: 'no-store' })
        const payload = (await response.json()) as InfrastructureResponse
        setData(payload)
      } catch (error) {
        console.error('Failed to load infrastructure data', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="rounded-3xl border border-[#2a2d37] bg-[#1a1d27] p-8 text-center text-[#9ca3af]">
        Loading infrastructure telemetry...
      </div>
    )
  }

  return (
    <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      {data.servers.map((server) => (
        <article
          key={server.ip}
          className="rounded-3xl border border-[#2a2d37] bg-[#1a1d27] p-6 shadow-[0_16px_40px_rgba(0,0,0,0.22)]"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#d4a853]">Server</p>
              <h3 className="mt-3 text-2xl font-semibold text-white">{server.hostname}</h3>
              <p className="mt-2 text-sm text-[#9ca3af]">{server.ip}</p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/10 px-3 py-1 text-sm">
              <span className={`h-2.5 w-2.5 rounded-full ${server.status === 'online' ? 'bg-emerald-400' : 'bg-red-400'}`} />
              <span className="capitalize text-white">{server.status}</span>
            </div>
          </div>

          <div className="mt-8 space-y-5">
            <MetricBar label="CPU" value={server.cpu} />
            <MetricBar label="RAM" value={server.ram} />
            <MetricBar label="Disk" value={server.disk} />
          </div>
        </article>
      ))}
    </section>
  )
}
