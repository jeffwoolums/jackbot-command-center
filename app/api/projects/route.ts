import { NextResponse } from 'next/server'

// Mock project data - would connect to git repos in production
const mockProjects = [
  {
    id: 'lessoncraft',
    name: 'LessonCraft',
    description: 'AI-powered lesson planning platform',
    status: 'building' as const,
    progress: 85,
    url: 'https://lessoncraft.aituned.io',
    repo: 'https://github.com/aituned/lessoncraft',
    lastCommit: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    branch: 'main',
    buildStatus: 'success',
    technologies: ['Next.js', 'TypeScript', 'Tailwind', 'OpenAI']
  },
  {
    id: 'gospel-tuned-core',
    name: 'Gospel Tuned Core',
    description: 'Core gospel content generation system',
    status: 'building' as const,
    progress: 60,
    repo: 'https://github.com/aituned/gospel-tuned-core',
    lastCommit: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    branch: 'main',
    buildStatus: 'building',
    technologies: ['Python', 'FastAPI', 'OpenAI', 'PostgreSQL']
  },
  {
    id: 'jackbot-command-center',
    name: 'Jackbot Command Center',
    description: 'Central operations dashboard',
    status: 'building' as const,
    progress: 40,
    repo: 'https://github.com/aituned/jackbot-command-center',
    lastCommit: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    branch: 'main',
    buildStatus: 'building',
    technologies: ['Next.js', 'TypeScript', 'Tailwind', 'OpenClaw API']
  },
  {
    id: 'scrollwork',
    name: 'Scrollwork',
    description: 'AI-generated scroll art platform',
    status: 'planning' as const,
    progress: 10,
    repo: 'https://github.com/aituned/scrollwork',
    lastCommit: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    branch: 'planning',
    buildStatus: 'pending',
    technologies: ['React', 'Canvas API', 'Stable Diffusion']
  },
  {
    id: 'aituned-platform',
    name: 'AI Tuned Platform',
    description: 'Main platform website',
    status: 'live' as const,
    progress: 100,
    url: 'https://aituned.io',
    repo: 'https://github.com/aituned/aituned-site',
    lastCommit: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    branch: 'main',
    buildStatus: 'success',
    technologies: ['Next.js', 'TypeScript', 'Tailwind', 'Cloudflare']
  }
]

export async function GET() {
  return NextResponse.json({ projects: mockProjects })
}