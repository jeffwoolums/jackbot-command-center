import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const dataPath = path.join(process.cwd(), 'data', 'feature-requests.json')

export async function GET() {
  try {
    const data = await fs.readFile(dataPath, 'utf-8')
    return NextResponse.json(JSON.parse(data))
  } catch (error) {
    return NextResponse.json({ featureRequests: [] }, { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = JSON.parse(await fs.readFile(dataPath, 'utf-8'))
    
    const newFeature = {
      id: `feature-${Date.now()}`,
      ...body,
      createdAt: new Date().toISOString()
    }
    
    data.featureRequests.push(newFeature)
    await fs.writeFile(dataPath, JSON.stringify(data, null, 2))
    
    return NextResponse.json(newFeature, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add feature request' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, convertToTask } = body
    
    const data = JSON.parse(await fs.readFile(dataPath, 'utf-8'))
    const featureIndex = data.featureRequests.findIndex((f: any) => f.id === id)
    
    if (featureIndex === -1) {
      return NextResponse.json({ error: 'Feature request not found' }, { status: 404 })
    }
    
    data.featureRequests[featureIndex] = {
      ...data.featureRequests[featureIndex],
      status
    }
    
    await fs.writeFile(dataPath, JSON.stringify(data, null, 2))
    
    // If converting to task, we could also add to tasks.json here
    if (convertToTask) {
      // Optional: Add to tasks.json
      const feature = data.featureRequests[featureIndex]
      const tasksPath = path.join(process.cwd(), 'data', 'projects.json')
      const tasksData = JSON.parse(await fs.readFile(tasksPath, 'utf-8'))
      
      const newTask = {
        id: `task-${Date.now()}`,
        title: feature.title,
        project: feature.project,
        status: 'backlog',
        priority: feature.priority,
        owner: 'Jackbot'
      }
      
      tasksData.tasks.push(newTask)
      await fs.writeFile(tasksPath, JSON.stringify(tasksData, null, 2))
    }
    
    return NextResponse.json(data.featureRequests[featureIndex])
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update feature request' }, { status: 500 })
  }
}