import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const dataPath = path.join(process.cwd(), 'data', 'recovered-tasks.json')

export async function GET() {
  try {
    const data = await fs.readFile(dataPath, 'utf-8')
    return NextResponse.json(JSON.parse(data))
  } catch (error) {
    return NextResponse.json({ recoveredTasks: [] }, { status: 200 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status } = body
    
    const data = JSON.parse(await fs.readFile(dataPath, 'utf-8'))
    const taskIndex = data.recoveredTasks.findIndex((t: any) => t.id === id)
    
    if (taskIndex === -1) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }
    
    data.recoveredTasks[taskIndex] = {
      ...data.recoveredTasks[taskIndex],
      status
    }
    
    await fs.writeFile(dataPath, JSON.stringify(data, null, 2))
    
    return NextResponse.json(data.recoveredTasks[taskIndex])
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
  }
}