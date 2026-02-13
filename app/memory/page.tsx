'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'

interface MemoryFile {
  path: string
  name: string
  content: string
  modified: string
  size: number
}

interface SearchResult {
  file: string
  line: number
  content: string
  context: string[]
}

type DateFilter = 'all' | 'today' | 'week'

export default function MemoryPage() {
  const [files, setFiles] = useState<MemoryFile[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState<DateFilter>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMemoryFiles = async () => {
      try {
        const res = await fetch('/api/memory', { cache: 'no-store' })
        const data = await res.json()
        setFiles(data.files || [])
      } catch (e) {
        console.error('Failed to fetch memory files:', e)
      } finally {
        setLoading(false)
      }
    }

    fetchMemoryFiles()
  }, [])

  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        document.getElementById('memory-search')?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyboard)
    return () => document.removeEventListener('keydown', handleKeyboard)
  }, [])

  const filteredFiles = useMemo(() => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

    return files.filter(file => {
      const fileDate = new Date(file.modified)
      if (dateFilter === 'today') return fileDate >= today
      if (dateFilter === 'week') return fileDate >= weekAgo
      return true
    })
  }, [files, dateFilter])

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []

    const query = searchQuery.toLowerCase()
    const results: SearchResult[] = []

    filteredFiles.forEach(file => {
      const lines = file.content.split('\n')
      lines.forEach((line, index) => {
        if (line.toLowerCase().includes(query)) {
          const contextStart = Math.max(0, index - 2)
          const contextEnd = Math.min(lines.length, index + 3)
          results.push({
            file: file.name,
            line: index + 1,
            content: line,
            context: lines.slice(contextStart, contextEnd)
          })
        }
      })
    })

    return results
  }, [searchQuery, filteredFiles])

  const highlightText = (text: string, query: string) => {
    if (!query) return text
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`(${escapedQuery})`, 'gi')
    const parts = text.split(regex)

    return (
      <>
        {parts.map((part, i) => (
          part.toLowerCase() === query.toLowerCase()
            ? <span key={i} className="bg-yellow-500 text-black px-1 rounded">{part}</span>
            : <span key={i}>{part}</span>
        ))}
      </>
    )
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur border-b border-slate-800 px-6 py-4">
        <div className="flex items-center justify-between max-w-[1400px] mx-auto">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 rounded-lg hover:bg-slate-800 transition-colors">←</Link>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">🧠 Memory Search</h1>
              <p className="text-slate-500 text-sm">Search MEMORY.md, ACTIVE_CONTEXT.md, and memory/*.md • Press ⌘K</p>
            </div>
          </div>
          <div className="text-slate-400 text-sm">{filteredFiles.length} files indexed</div>
        </div>
      </header>

      <main className="p-6 max-w-[1400px] mx-auto">
        <div className="mb-6 space-y-4">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
            <input
              id="memory-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search all memory files... (⌘K)"
              className="w-full pl-12 pr-4 py-4 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-lg"
              autoComplete="off"
            />
          </div>

          <div className="flex items-center gap-4">
            <span className="text-slate-400">📅</span>
            <div className="flex bg-slate-900 rounded-lg p-1">
              {(['all', 'today', 'week'] as DateFilter[]).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setDateFilter(filter)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    dateFilter === filter ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {filter === 'all' && 'All Time'}
                  {filter === 'today' && 'Today'}
                  {filter === 'week' && 'This Week'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64 text-slate-500 text-lg">Loading memory files...</div>
        ) : searchQuery ? (
          <div className="space-y-4">
            {searchResults.length > 0 ? (
              <>
                <div className="text-slate-400 text-sm">Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchQuery}"</div>
                {searchResults.map((result, index) => (
                  <div key={`${result.file}-${result.line}-${index}`} className="bg-slate-900 rounded-lg border border-slate-700 p-4 hover:border-slate-600 transition-colors">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-amber-400">📄</span>
                      <span className="font-medium text-amber-400">{result.file}</span>
                      <span className="text-slate-500 text-sm">Line {result.line}</span>
                    </div>
                    <div className="bg-slate-800 rounded p-3 font-mono text-sm mb-3">{highlightText(result.content, searchQuery)}</div>
                    <div className="text-slate-400 text-sm">
                      <div className="font-medium mb-2">Context:</div>
                      <div className="space-y-1">
                        {result.context.map((line, i) => (
                          <div key={i} className={`font-mono text-xs ${line === result.content ? 'text-white bg-slate-800 px-2 py-1 rounded' : 'text-slate-500'}`}>
                            {line || '(empty line)'}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="text-center py-12 text-slate-500">
                <div className="text-4xl mb-4">🔎</div>
                <div className="text-lg">No results found for "{searchQuery}"</div>
                <div className="text-sm mt-2">Try different keywords or adjust the date filter</div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-slate-400 text-lg font-medium mb-6">📂 Available Memory Files</div>
            <div className="grid gap-4">
              {filteredFiles.map(file => (
                <div key={file.path} className="bg-slate-900 rounded-lg border border-slate-700 p-4 hover:border-slate-600 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-400">📄</span>
                      <span className="font-medium text-white">{file.name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <span>{formatFileSize(file.size)}</span>
                      <span>{formatDate(file.modified)}</span>
                    </div>
                  </div>
                  <div className="text-slate-400 text-sm">{file.path}</div>
                  <div className="text-slate-500 text-sm mt-2">{file.content.split('\n').length} lines</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
