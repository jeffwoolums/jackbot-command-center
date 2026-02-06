import { NextResponse } from 'next/server'

// Mock data for sub-agents
const mockAgents = [
  {
    id: 'codex',
    name: 'Codex',
    description: 'The muscle - rough, gets shit done',
    status: 'ready',
    lastRun: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    tasksCompleted: 42,
    voice: 'Deep, gruff, commanding',
    personality: 'Action-oriented, no-nonsense'
  },
  {
    id: 'kimi',
    name: 'KIMI',
    description: 'The lady - professional, sharp',
    status: 'idle',
    lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    tasksCompleted: 28,
    voice: 'Professional female, warm but sharp',
    personality: 'Analytical, detail-oriented'
  },
  {
    id: 'scout',
    name: 'Scout',
    description: 'Research and intelligence gathering',
    status: 'active',
    lastRun: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    tasksCompleted: 15,
    voice: 'Curious, energetic',
    personality: 'Explorer, information gatherer'
  },
  {
    id: 'builder',
    name: 'Builder',
    description: 'Infrastructure and deployment',
    status: 'ready',
    lastRun: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    tasksCompleted: 36,
    voice: 'Methodical, calm',
    personality: 'Architect, systems thinker'
  }
]

export async function GET() {
  return NextResponse.json({ agents: mockAgents })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { agentId, task } = body
    
    // In production, this would trigger a real sub-agent spawn
    console.log(`Spawning agent ${agentId} with task: ${task}`)
    
    return NextResponse.json({ 
      success: true, 
      message: `Agent ${agentId} spawned successfully`,
      taskId: `task-${Date.now()}`,
      estimatedCompletion: new Date(Date.now() + 5 * 60 * 1000).toISOString()
    })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to spawn agent' 
    }, { status: 500 })
  }
}