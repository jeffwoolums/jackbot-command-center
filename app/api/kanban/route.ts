import { NextRequest, NextResponse } from 'next/server'
import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'

interface KanbanTask {
  id: string
  title: string
  status: 'backlog' | 'inprogress' | 'done'
  priority: 'high' | 'medium' | 'low'
  project: 'LessonCraft' | 'JD Gallery' | 'Infrastructure' | 'Content' | 'Other'
  owner: string
  source: 'manual' | 'todo' | 'active_context' | 'subagent'
  createdAt: string
  updatedAt: string
  description?: string
  tags?: string[]
}

const JACKBOT_DIR = join(process.env.HOME || '', 'Jackbot')
const DATA_DIR = join(process.cwd(), 'data')
const KANBAN_FILE = join(DATA_DIR, 'kanban-tasks.json')

const PROJECT_COLORS = {
  'LessonCraft': 'border-amber-500 bg-amber-500/10',
  'JD Gallery': 'border-green-500 bg-green-500/10', 
  'Infrastructure': 'border-blue-500 bg-blue-500/10',
  'Content': 'border-purple-500 bg-purple-500/10',
  'Other': 'border-slate-500 bg-slate-500/10'
}

async function loadExistingTasks(): Promise<KanbanTask[]> {
  try {
    const data = await readFile(KANBAN_FILE, 'utf-8')
    const parsed = JSON.parse(data) as Array<Record<string, unknown>>
    return parsed.map((task) => {
      const rawStatus = String(task.status || 'backlog')
      const status: KanbanTask['status'] = rawStatus === 'done'
        ? 'done'
        : rawStatus === 'inprogress' || rawStatus === 'blocked'
          ? 'inprogress'
          : 'backlog'

      return {
        id: String(task.id || `legacy-${Date.now()}`),
        title: String(task.title || 'Untitled task'),
        status,
        priority: (String(task.priority || 'medium') as KanbanTask['priority']),
        project: (String(task.project || 'Other') as KanbanTask['project']),
        owner: String(task.owner || 'System'),
        source: (String(task.source || 'manual') as KanbanTask['source']),
        createdAt: String(task.createdAt || new Date().toISOString()),
        updatedAt: String(task.updatedAt || new Date().toISOString()),
        description: typeof task.description === 'string' ? task.description : undefined,
        tags: Array.isArray(task.tags) ? task.tags.map(String) : []
      }
    })
  } catch {
    return []
  }
}

async function saveKanbanTasks(tasks: KanbanTask[]) {
  await writeFile(KANBAN_FILE, JSON.stringify(tasks, null, 2))
}

function extractTasksFromMarkdown(content: string, source: 'todo' | 'active_context'): Partial<KanbanTask>[] {
  const tasks: Partial<KanbanTask>[] = []
  const lines = content.split('\n')
  
  let currentProject = 'Other'
  let currentPriority: 'high' | 'medium' | 'low' = 'medium'
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    // Detect project sections
    if (line.includes('LessonCraft')) currentProject = 'LessonCraft'
    else if (line.includes('JD Gallery') || line.includes('Gallery')) currentProject = 'JD Gallery'
    else if (line.includes('Infrastructure') || line.includes('Command Center')) currentProject = 'Infrastructure'
    else if (line.includes('Content') || line.includes('Gospel Tuned')) currentProject = 'Content'
    
    // Detect priority markers
    if (line.includes('🔥') || line.includes('HIGH') || line.includes('URGENT')) currentPriority = 'high'
    else if (line.includes('⚠️') || line.includes('MEDIUM')) currentPriority = 'medium'
    else if (line.includes('📝') || line.includes('LOW')) currentPriority = 'low'
    
    // Extract tasks (lines starting with -, *, or [ ])
    if (line.match(/^[\-\*]\s+/) || line.match(/^-?\s*\[\s*[x\s]\s*\]\s*/)) {
      let taskTitle = line
        .replace(/^[\-\*]\s*/, '')
        .replace(/^-?\s*\[\s*[x\s]\s*\]\s*/, '')
        .trim()
      
      if (!taskTitle || taskTitle.length < 3) continue
      
      // Skip completed tasks (checked boxes)
      if (line.includes('[x]') || line.includes('[X]')) continue
      
      // Determine status based on content
      let status: KanbanTask['status'] = 'backlog'
      if (source === 'active_context') {
        if (line.toUpperCase().includes('WORKING ON') || line.toUpperCase().includes('IN PROGRESS') || line.toUpperCase().includes('DOING')) {
          status = 'inprogress'
        } else if (line.toUpperCase().includes('BLOCKED') || line.toUpperCase().includes('WAITING')) {
          status = 'inprogress'
          taskTitle = `[BLOCKED] ${taskTitle}`
        }
      }
      
      // Clean up task title
      taskTitle = taskTitle
        .replace(/🔥|⚠️|📝/g, '')
        .replace(/HIGH|MEDIUM|LOW|URGENT/gi, '')
        .trim()
      
      tasks.push({
        title: taskTitle,
        status,
        priority: currentPriority,
        project: currentProject as KanbanTask['project'],
        source,
        description: lines[i + 1] && lines[i + 1].startsWith('  ') ? lines[i + 1].trim() : undefined
      })
    }
  }
  
  return tasks
}

async function parseActiveSubagents(): Promise<Partial<KanbanTask>[]> {
  try {
    // Check for active subagent sessions
    const agentsResponse = await fetch('http://localhost:3333/api/agents')
    const agentsData = await agentsResponse.json()
    
    const subagentTasks: Partial<KanbanTask>[] = []
    
    if (agentsData.agents) {
      for (const agent of agentsData.agents) {
        if (agent.status !== 'active') continue

        subagentTasks.push({
          title: agent.currentTask || agent.description || `${agent.name} active task`,
          status: 'inprogress',
          priority: 'high',
          project: 'Infrastructure',
          source: 'subagent',
          owner: agent.name || 'Subagent',
          description: `Active subagent: ${agent.specialty || agent.personality || agent.name}`
        })
      }
    }
    
    return subagentTasks
  } catch {
    return []
  }
}

async function syncTasksFromFiles(): Promise<KanbanTask[]> {
  const existingTasks = await loadExistingTasks()
  const newTasks: KanbanTask[] = []
  
  // Read TODO.md
  try {
    const todoContent = await readFile(join(JACKBOT_DIR, 'TODO.md'), 'utf-8')
    const todoTasks = extractTasksFromMarkdown(todoContent, 'todo')
    
    for (const taskData of todoTasks) {
      const existingTask = existingTasks.find(t => 
        t.title === taskData.title && t.source === 'todo'
      )
      
      if (!existingTask) {
        newTasks.push({
          id: `todo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: taskData.title!,
          status: taskData.status!,
          priority: taskData.priority!,
          project: taskData.project!,
          owner: 'System',
          source: 'todo',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          description: taskData.description
        })
      }
    }
  } catch (e) {
    console.warn('TODO.md not found or unreadable')
  }
  
  // Read ACTIVE_CONTEXT.md
  try {
    const activeContent = await readFile(join(JACKBOT_DIR, 'ACTIVE_CONTEXT.md'), 'utf-8')
    const activeTasks = extractTasksFromMarkdown(activeContent, 'active_context')
    
    for (const taskData of activeTasks) {
      const existingTask = existingTasks.find(t => 
        t.title === taskData.title && t.source === 'active_context'
      )
      
      if (!existingTask) {
        newTasks.push({
          id: `active-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: taskData.title!,
          status: taskData.status!,
          priority: taskData.priority!,
          project: taskData.project!,
          owner: 'Active Context',
          source: 'active_context',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          description: taskData.description
        })
      }
    }
  } catch (e) {
    console.warn('ACTIVE_CONTEXT.md not found or unreadable')
  }
  
  // Get subagent tasks
  const subagentTasks = await parseActiveSubagents()
  for (const taskData of subagentTasks) {
    // Always refresh subagent tasks
    newTasks.push({
      id: `subagent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: taskData.title!,
      status: taskData.status!,
      priority: taskData.priority!,
      project: taskData.project!,
      owner: taskData.owner || 'Subagent',
      source: 'subagent',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      description: taskData.description
    })
  }
  
  // Merge with existing manual tasks and updated auto tasks
  const manualTasks = existingTasks.filter(t => t.source === 'manual')
  const autoTasks = existingTasks.filter(t => t.source !== 'manual' && t.source !== 'subagent')
  
  const allTasks = [...manualTasks, ...autoTasks, ...newTasks]
  
  await saveKanbanTasks(allTasks)
  return allTasks
}

export async function GET() {
  try {
    const tasks = await syncTasksFromFiles()
    
    return NextResponse.json({
      tasks,
      columns: [
        { id: 'backlog', title: 'Backlog', color: 'border-slate-600' },
        { id: 'inprogress', title: 'In Progress', color: 'border-amber-500' },
        { id: 'done', title: 'Done', color: 'border-green-500' }
      ],
      projectColors: PROJECT_COLORS
    })
  } catch (error) {
    console.error('Kanban API error:', error)
    return NextResponse.json(
      { error: 'Failed to load kanban tasks' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const tasks = await loadExistingTasks()
    
    if (body.action === 'move') {
      // Move task between columns
      const taskIndex = tasks.findIndex(t => t.id === body.taskId)
      if (taskIndex !== -1) {
        tasks[taskIndex].status = body.newStatus
        tasks[taskIndex].updatedAt = new Date().toISOString()
      }
    } else if (body.action === 'create') {
      // Create new manual task
      const newTask: KanbanTask = {
        id: `manual-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: body.title,
        status: body.status || 'backlog',
        priority: body.priority || 'medium',
        project: body.project || 'Other',
        owner: body.owner || 'Manual',
        source: 'manual',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        description: body.description,
        tags: body.tags || []
      }
      tasks.push(newTask)
    } else if (body.action === 'update') {
      // Update existing task
      const taskIndex = tasks.findIndex(t => t.id === body.id)
      if (taskIndex !== -1) {
        tasks[taskIndex] = {
          ...tasks[taskIndex],
          ...body.updates,
          updatedAt: new Date().toISOString()
        }
      }
    } else if (body.action === 'delete') {
      // Delete task (only manual tasks)
      const taskIndex = tasks.findIndex(t => t.id === body.id && t.source === 'manual')
      if (taskIndex !== -1) {
        tasks.splice(taskIndex, 1)
      }
    }
    
    await saveKanbanTasks(tasks)
    
    return NextResponse.json({ success: true, tasks })
  } catch (error) {
    console.error('Kanban POST error:', error)
    return NextResponse.json(
      { error: 'Failed to update kanban tasks' },
      { status: 500 }
    )
  }
}