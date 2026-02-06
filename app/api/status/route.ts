import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function GET() {
  try {
    // Get sessions from OpenClaw
    let sessions: any[] = []
    try {
      const { stdout } = await execAsync('openclaw sessions list --json 2>/dev/null')
      const parsed = JSON.parse(stdout.trim())
      sessions = (parsed.sessions || []).map((s: any) => ({
        key: s.key || 'unknown',
        kind: s.kind || 'direct',
        model: s.model || 'unknown',
        age: formatAge(s.ageMs),
        tokens: s.totalTokens?.toLocaleString() || 'N/A'
      }))
    } catch (e) {
      console.error('Sessions fetch error:', e)
    }

    // Get cron jobs from OpenClaw
    let cronJobs: any[] = []
    try {
      const { stdout } = await execAsync('openclaw cron list --json 2>/dev/null')
      const parsed = JSON.parse(stdout.trim())
      cronJobs = (parsed.jobs || []).map((job: any) => ({
        id: job.id,
        name: job.name || 'Unnamed',
        schedule: job.schedule?.expr || job.schedule?.kind || 'Unknown',
        next: formatNextRun(job.state?.nextRunAtMs),
        status: job.enabled !== false ? 'active' : 'disabled'
      }))
    } catch (e) {
      console.error('Cron fetch error:', e)
    }

    return NextResponse.json({
      status: 'online',
      sessions,
      cronJobs,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Status API error:', error)
    return NextResponse.json({ 
      status: 'error',
      sessions: [],
      cronJobs: [],
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

function formatAge(ms: number): string {
  if (!ms) return 'active'
  const seconds = Math.floor(ms / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function formatNextRun(ms: number): string {
  if (!ms) return 'N/A'
  const date = new Date(ms)
  const now = new Date()
  const diffMs = ms - now.getTime()
  
  if (diffMs < 0) return 'overdue'
  if (diffMs < 3600000) return `in ${Math.floor(diffMs / 60000)}m`
  if (diffMs < 86400000) return `in ${Math.floor(diffMs / 3600000)}h`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
