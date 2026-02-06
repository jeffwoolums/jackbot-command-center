export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function GET() {
  try {
    // Run openclaw cron list command
    const { stdout, stderr } = await execAsync('openclaw cron list --json')
    
    if (stderr) {
      console.error('Error fetching cron jobs:', stderr)
      return NextResponse.json({ error: stderr }, { status: 500 })
    }

    // Parse the JSON output
    let cronData
    try {
      cronData = JSON.parse(stdout)
    } catch (parseError) {
      console.error('Error parsing cron JSON:', parseError)
      // If not JSON, parse as text
      const lines = stdout.trim().split('\n').filter(line => line.trim())
      cronData = lines.map((line, index) => {
        const parts = line.split(/\s+/)
        return {
          id: `cron-${index}`,
          schedule: parts[0] || 'unknown',
          command: parts.slice(1).join(' ') || 'unknown',
          status: 'active',
          lastRun: 'unknown',
          nextRun: 'unknown'
        }
      })
    }

    return NextResponse.json({ cron: cronData })
  } catch (error) {
    console.error('Error in cron API:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch cron jobs',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}