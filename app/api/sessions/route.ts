export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function GET() {
  try {
    // Run openclaw sessions list command
    const { stdout, stderr } = await execAsync('openclaw sessions list')
    
    if (stderr) {
      console.error('Error fetching sessions:', stderr)
      return NextResponse.json({ error: stderr }, { status: 500 })
    }

    // Parse the text output
    const lines = stdout.trim().split('\n')
    if (lines.length < 3) {
      return NextResponse.json({ sessions: [] })
    }

    // Skip header lines (first 2 lines)
    const sessionLines = lines.slice(2)
    const sessionsData = sessionLines.map((line, index) => {
      // Parse the session line - handle variable spacing
      const parts = line.split(/\s+/).filter(p => p.trim())
      
      if (parts.length < 6) {
        return {
          id: `session-${index}`,
          name: line.substring(0, 30) || `Session ${index}`,
          status: 'unknown',
          lastActive: 'unknown',
          model: 'unknown',
          tokens: '0/0 (0%)',
          flags: ''
        }
      }

      // Extract parts based on typical format
      const kind = parts[0]
      const key = parts[1]
      const age = parts[2] + (parts[3] ? ' ' + parts[3] : '')
      
      // Model might have spaces, so we need to find where tokens start
      let modelEndIndex = parts.length - 2
      for (let i = 4; i < parts.length; i++) {
        if (parts[i].includes('/') || parts[i].includes('(')) {
          modelEndIndex = i
          break
        }
      }
      
      const model = parts.slice(4, modelEndIndex).join(' ')
      const tokens = parts[modelEndIndex] || '0/0 (0%)'
      const flags = parts.slice(modelEndIndex + 1).join(' ') || ''

      // Determine status based on age
      let status = 'idle'
      if (age.includes('m ago')) {
        const minutes = parseInt(age)
        if (!isNaN(minutes) && minutes < 5) {
          status = 'active'
        }
      } else if (age.includes('s ago')) {
        status = 'active'
      }

      return {
        id: `session-${index}`,
        name: key,
        status,
        lastActive: age,
        model,
        tokens,
        flags,
        kind
      }
    }).filter(session => session.name && !session.name.includes('...'))

    return NextResponse.json({ sessions: sessionsData })
  } catch (error) {
    console.error('Error in sessions API:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch sessions',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}