import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

const dataPath = path.join(process.cwd(), 'data', 'projects.json')

export async function GET() {
  try {
    const data = await fs.readFile(dataPath, 'utf-8')
    return NextResponse.json(JSON.parse(data))
  } catch (error) {
    console.error('Failed to load projects:', error)
    // Return empty data structure on error
    return NextResponse.json({
      projects: [],
      tasks: [],
      blockers: [],
      agents: [],
      timeline: []
    })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { taskId, newStatus } = body

    const data = await fs.readFile(dataPath, 'utf-8')
    const parsed = JSON.parse(data)

    // Update task status
    parsed.tasks = parsed.tasks.map((task: { id: string; status: string }) => 
      task.id === taskId ? { ...task, status: newStatus } : task
    )

    await fs.writeFile(dataPath, JSON.stringify(parsed, null, 2))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to update task:', error)
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}
