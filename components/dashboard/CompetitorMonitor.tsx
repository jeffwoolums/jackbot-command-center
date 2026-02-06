'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'

interface Competitor {
  id: string
  name: string
  platform: 'youtube' | 'twitter' | 'github' | 'producthunt'
  status: 'active' | 'inactive' | 'trending'
  lastActivity: string
  followers: number
  growth: number
  latestContent: string
  url: string
}

interface TrendingContent {
  id: string
  title: string
  source: string
  engagement: number
  timestamp: string
  url: string
}

export function CompetitorMonitor() {
  const [competitors, setCompetitors] = useState<Competitor[]>([
    {
      id: 'alex-finn',
      name: 'Alex Finn',
      platform: 'youtube',
      status: 'active',
      lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      followers: 125000,
      growth: 2.3,
      latestContent: 'Building AI agents that make $10k/month',
      url: 'https://youtube.com/@alexfinn'
    },
    {
      id: 'matt-woolums',
      name: 'Matt Woolums',
      platform: 'twitter',
      status: 'trending',
      lastActivity: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      followers: 85000,
      growth: 5.7,
      latestContent: 'Just launched AI voice cloning API',
      url: 'https://twitter.com/mattwoolums'
    },
    {
      id: 'ai-news',
      name: 'AI News Daily',
      platform: 'twitter',
      status: 'active',
      lastActivity: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      followers: 320000,
      growth: 1.2,
      latestContent: 'OpenAI announces GPT-5 release date',
      url: 'https://twitter.com/ainewsdaily'
    },
    {
      id: 'langchain',
      name: 'LangChain',
      platform: 'github',
      status: 'active',
      lastActivity: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      followers: 85000,
      growth: 0.8,
      latestContent: 'Released v0.2.0 with new agent tools',
      url: 'https://github.com/langchain-ai'
    },
    {
      id: 'cursor',
      name: 'Cursor AI',
      platform: 'producthunt',
      status: 'trending',
      lastActivity: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      followers: 0,
      growth: 15.4,
      latestContent: 'AI-powered code editor hits #1 Product of the Day',
      url: 'https://producthunt.com/posts/cursor-ai'
    }
  ])

  const [trendingContent, setTrendingContent] = useState<TrendingContent[]>([
    {
      id: '1',
      title: 'AI Agents Making $10k/Month - Full Tutorial',
      source: 'YouTube',
      engagement: 12500,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      url: '#'
    },
    {
      id: '2',
      title: 'GPT-5 Release Date Leaked - What to Expect',
      source: 'Twitter',
      engagement: 8500,
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      url: '#'
    },
    {
      id: '3',
      title: 'Local Voice Cloning with XTTS v2 - Free & Open Source',
      source: 'GitHub',
      engagement: 3200,
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      url: '#'
    },
    {
      id: '4',
      title: 'AI Code Editors Comparison: Cursor vs. Windsurf vs. Codeium',
      source: 'Product Hunt',
      engagement: 2100,
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      url: '#'
    }
  ])

  const [selectedPlatform, setSelectedPlatform] = useState<string>('all')

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    
    if (diffHours < 1) return 'just now'
    if (diffHours < 24) return `${diffHours}h ago`
    return `${Math.floor(diffHours / 24)}d ago`
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'youtube': return '📺'
      case 'twitter': return '🐦'
      case 'github': return '💻'
      case 'producthunt': return '🦄'
      default: return '🌐'
    }
  }

  const filteredCompetitors = selectedPlatform === 'all' 
    ? competitors 
    : competitors.filter(c => c.platform === selectedPlatform)

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Competitor Monitor</h2>
        <span className="text-xs text-amber-400">Alex Finn Tracked</span>
      </div>
      
      {/* Platform Filter */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setSelectedPlatform('all')}
          className={`px-3 py-1 text-xs rounded-lg transition-colors ${
            selectedPlatform === 'all'
              ? 'bg-amber-500 text-white'
              : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setSelectedPlatform('youtube')}
          className={`px-3 py-1 text-xs rounded-lg transition-colors ${
            selectedPlatform === 'youtube'
              ? 'bg-red-500 text-white'
              : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
          }`}
        >
          📺 YouTube
        </button>
        <button
          onClick={() => setSelectedPlatform('twitter')}
          className={`px-3 py-1 text-xs rounded-lg transition-colors ${
            selectedPlatform === 'twitter'
              ? 'bg-blue-500 text-white'
              : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
          }`}
        >
          🐦 Twitter
        </button>
      </div>
      
      {/* Competitors List */}
      <div className="space-y-3 mb-6">
        {filteredCompetitors.map(competitor => (
          <div 
            key={competitor.id}
            className="p-3 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="text-lg">{getPlatformIcon(competitor.platform)}</div>
                <div>
                  <div className="font-medium text-white">{competitor.name}</div>
                  <div className="text-xs text-slate-400">
                    {formatNumber(competitor.followers)} followers
                    <span className={`ml-2 ${competitor.growth > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {competitor.growth > 0 ? '+' : ''}{competitor.growth}%
                    </span>
                  </div>
                </div>
              </div>
              <div className={`text-xs px-2 py-1 rounded ${
                competitor.status === 'trending' ? 'bg-amber-500/20 text-amber-400' :
                competitor.status === 'active' ? 'bg-green-500/20 text-green-400' :
                'bg-slate-500/20 text-slate-400'
              }`}>
                {competitor.status}
              </div>
            </div>
            
            <div className="text-sm text-slate-300 mb-2">
              {competitor.latestContent}
            </div>
            
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{formatTime(competitor.lastActivity)}</span>
              <a 
                href={competitor.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 hover:text-amber-300 transition-colors"
              >
                View →
              </a>
            </div>
          </div>
        ))}
      </div>
      
      {/* Trending Content */}
      <div>
        <h3 className="text-sm font-medium text-slate-400 mb-3">Trending AI Content</h3>
        <div className="space-y-3">
          {trendingContent.map(content => (
            <div 
              key={content.id}
              className="p-3 bg-slate-800/20 rounded-lg hover:bg-slate-800/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="font-medium text-white text-sm">{content.title}</div>
                <div className="text-xs text-slate-400">{content.source}</div>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>👁️ {formatNumber(content.engagement)} engagement</span>
                <span>{formatTime(content.timestamp)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Stats */}
      <div className="mt-4 pt-4 border-t border-slate-800">
        <div className="flex items-center justify-between text-sm">
          <div>
            <span className="text-slate-400">Tracked: </span>
            <span className="text-white">{competitors.length}</span>
          </div>
          <div className="flex items-center gap-4">
            <div>
              <span className="text-slate-400">Trending: </span>
              <span className="text-amber-400">
                {competitors.filter(c => c.status === 'trending').length}
              </span>
            </div>
            <div>
              <span className="text-slate-400">Avg Growth: </span>
              <span className="text-green-400">
                +{Math.round(competitors.reduce((sum, c) => sum + c.growth, 0) / competitors.length)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}