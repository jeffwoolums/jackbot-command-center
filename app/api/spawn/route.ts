import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { task, agent = 'codex' } = body

    if (!task) {
      return NextResponse.json({ error: 'Task is required' }, { status: 400 })
    }

    // Create a spawn command for the agent
    const spawnCommand = `openclaw agent spawn ${agent} --task "${task}"`
    
    console.log('Spawning agent with command:', spawnCommand)
    
    // Execute the spawn command
    const { stdout, stderr } = await execAsync(spawnCommand)
    
    if (stderr) {
      console.error('Error spawning agent:', stderr)
      return NextResponse.json({ 
        error: 'Failed to spawn agent',
        details: stderr 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: `Agent ${agent} spawned successfully`,
      output: stdout,
      task
    })
  } catch (error) {
    console.error('Error in spawn API:', error)
    return NextResponse.json({ 
      error: 'Failed to spawn agent',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}