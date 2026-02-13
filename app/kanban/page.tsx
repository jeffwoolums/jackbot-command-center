'use client'

import Link from 'next/link'
import EnhancedKanbanBoard from '@/components/dashboard/EnhancedKanbanBoard'

export default function KanbanPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur border-b border-slate-800 px-6 py-4">
        <div className="flex items-center justify-between max-w-[1600px] mx-auto">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 rounded-lg hover:bg-slate-800 transition-colors">←</Link>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
                📋 Enhanced Kanban Board
              </h1>
              <p className="text-slate-500 text-sm">Auto-synced with TODO.md and ACTIVE_CONTEXT.md • Drag & drop to organize</p>
            </div>
          </div>
          
          <div className="text-slate-400 text-sm">
            Tasks update every 30 seconds
          </div>
        </div>
      </header>

      <main className="p-6 max-w-[1600px] mx-auto">
        <EnhancedKanbanBoard />
        
        {/* Info Panel */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900 rounded-lg p-4 border border-blue-500/30">
            <h3 className="font-bold text-blue-400 mb-2">📝 Auto-Import Sources</h3>
            <ul className="text-sm text-slate-400 space-y-1">
              <li>• TODO.md → Backlog tasks</li>
              <li>• ACTIVE_CONTEXT.md → In Progress</li>
              <li>• Active subagents → Live status</li>
            </ul>
          </div>
          
          <div className="bg-slate-900 rounded-lg p-4 border border-green-500/30">
            <h3 className="font-bold text-green-400 mb-2">🎨 Project Colors</h3>
            <ul className="text-sm text-slate-400 space-y-1">
              <li><span className="text-amber-400">●</span> LessonCraft (Gold)</li>
              <li><span className="text-green-400">●</span> JD Gallery (Green)</li>
              <li><span className="text-blue-400">●</span> Infrastructure (Blue)</li>
              <li><span className="text-purple-400">●</span> Content (Purple)</li>
            </ul>
          </div>
          
          <div className="bg-slate-900 rounded-lg p-4 border border-amber-500/30">
            <h3 className="font-bold text-amber-400 mb-2">🔄 Task Sources</h3>
            <ul className="text-sm text-slate-400 space-y-1">
              <li>✋ Manual - Created by users</li>
              <li>📝 TODO - From TODO.md file</li>
              <li>🎯 Active - From ACTIVE_CONTEXT.md</li>
              <li>🤖 Subagent - Live agent tasks</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}