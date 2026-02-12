import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const dataPath = path.join(process.cwd(), 'data', 'chairman-directives.json')

export async function GET() {
  try {
    const data = await fs.readFile(dataPath, 'utf-8')
    return NextResponse.json(JSON.parse(data))
  } catch (error) {
    return NextResponse.json({ directives: [] }, { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = JSON.parse(await fs.readFile(dataPath, 'utf-8'))
    
    const newDirective = {
      id: `directive-${Date.now()}`,
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    data.directives.push(newDirective)
    await fs.writeFile(dataPath, JSON.stringify(data, null, 2))
    
    return NextResponse.json(newDirective, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add directive' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status } = body
    
    const data = JSON.parse(await fs.readFile(dataPath, 'utf-8'))
    const directiveIndex = data.directives.findIndex((d: any) => d.id === id)
    
    if (directiveIndex === -1) {
      return NextResponse.json({ error: 'Directive not found' }, { status: 404 })
    }
    
    data.directives[directiveIndex] = {
      ...data.directives[directiveIndex],
      status,
      updatedAt: new Date().toISOString()
    }
    
    await fs.writeFile(dataPath, JSON.stringify(data, null, 2))
    
    return NextResponse.json(data.directives[directiveIndex])
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update directive' }, { status: 500 })
  }
}