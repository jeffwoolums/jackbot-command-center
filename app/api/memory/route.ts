import { NextResponse } from 'next/server'
import { readdir, readFile, stat } from 'fs/promises'
import { join } from 'path'

interface MemoryFile {
  path: string
  name: string
  content: string
  modified: string
  size: number
}

const JACKBOT_DIR = join(process.env.HOME || '', 'Jackbot')

async function readMemoryFile(fullPath: string, displayName: string): Promise<MemoryFile | null> {
  try {
    const [content, stats] = await Promise.all([
      readFile(fullPath, 'utf-8'),
      stat(fullPath)
    ])

    return {
      path: fullPath,
      name: displayName,
      content,
      modified: stats.mtime.toISOString(),
      size: stats.size
    }
  } catch {
    return null
  }
}

async function getMemoryFiles(): Promise<MemoryFile[]> {
  const files: MemoryFile[] = []

  const coreFiles: Array<{ fileName: string; label: string }> = [
    { fileName: 'MEMORY.md', label: 'MEMORY.md' },
    { fileName: 'ACTIVE_CONTEXT.md', label: 'ACTIVE_CONTEXT.md' }
  ]

  for (const file of coreFiles) {
    const memoryFile = await readMemoryFile(join(JACKBOT_DIR, file.fileName), file.label)
    if (memoryFile) files.push(memoryFile)
  }

  try {
    const memoryDir = join(JACKBOT_DIR, 'memory')
    const memoryFiles = await readdir(memoryDir)

    for (const fileName of memoryFiles) {
      if (!fileName.endsWith('.md')) continue
      const memoryFile = await readMemoryFile(join(memoryDir, fileName), `memory/${fileName}`)
      if (memoryFile) files.push(memoryFile)
    }
  } catch {
    // memory/ directory is optional
  }

  files.sort((a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime())
  return files
}

export async function GET() {
  try {
    const files = await getMemoryFiles()
    return NextResponse.json({
      files,
      count: files.length,
      totalSize: files.reduce((sum, f) => sum + f.size, 0)
    })
  } catch (error) {
    console.error('Memory API error:', error)
    return NextResponse.json({ error: 'Failed to fetch memory files' }, { status: 500 })
  }
}
