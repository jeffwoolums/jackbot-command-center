'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'

interface Idea {
  id: string
  title: string
  description: string
  category: 'product' | 'service' | 'saas' | 'content'
  margin: 'high' | 'medium' | 'low'
  effort: 'low' | 'medium' | 'high'
  timeToMarket: string
  potentialRevenue: string
  status: 'idea' | 'researching' | 'approved' | 'building'
  reasoning: string
}

const jackbotIdeas: Idea[] = [
  {
    id: '1',
    title: 'AI Resume Optimizer API',
    description: 'B2B API that job boards integrate to auto-optimize resumes for ATS systems. Per-call pricing.',
    category: 'saas',
    margin: 'high',
    effort: 'medium',
    timeToMarket: '2-3 weeks',
    potentialRevenue: '$50K-200K MRR',
    status: 'idea',
    reasoning: 'Job boards need differentiation. API = recurring revenue, no support overhead. $0.10-0.50 per optimization.'
  },
  {
    id: '2',
    title: 'White-Label AI Assistant Platform',
    description: 'Let agencies deploy branded AI assistants for their clients. We handle infra, they handle sales.',
    category: 'saas',
    margin: 'high',
    effort: 'high',
    timeToMarket: '4-6 weeks',
    potentialRevenue: '$100K+ MRR',
    status: 'idea',
    reasoning: 'Agencies have clients but no AI expertise. 70%+ margins on managed service.'
  },
  {
    id: '3',
    title: 'Sermon-to-Social Pipeline',
    description: 'Churches upload sermon audio → AI extracts quotes, generates social posts, creates clips. Subscription.',
    category: 'saas',
    margin: 'high',
    effort: 'low',
    timeToMarket: '1-2 weeks',
    potentialRevenue: '$20K-50K MRR',
    status: 'idea',
    reasoning: 'Perfect Gospel Tuned adjacent. Churches have content, no time to repurpose. $29-99/mo easy sell.'
  },
  {
    id: '4',
    title: 'AI Code Review Service',
    description: 'GitHub App that reviews PRs with AI, catches bugs, suggests improvements. Per-seat SaaS.',
    category: 'saas',
    margin: 'high',
    effort: 'medium',
    timeToMarket: '3-4 weeks',
    potentialRevenue: '$30K-100K MRR',
    status: 'idea',
    reasoning: 'Dev teams pay for quality. $15-30/seat/month. Integrates with existing workflow.'
  },
  {
    id: '5',
    title: 'LocalBiz AI Receptionist',
    description: 'AI phone answering for small businesses. Books appointments, answers FAQs, transfers urgent calls.',
    category: 'service',
    margin: 'high',
    effort: 'medium',
    timeToMarket: '2-3 weeks',
    potentialRevenue: '$50K-150K MRR',
    status: 'idea',
    reasoning: 'We have Twilio + voice. Small biz pays $200-500/mo to never miss a call. Dentists, HVAC, lawyers.'
  },
  {
    id: '6',
    title: 'AI Meeting Notes → Action Items',
    description: 'Zoom/Teams plugin that joins meetings, transcribes, extracts action items, sends follow-ups.',
    category: 'saas',
    margin: 'high',
    effort: 'medium',
    timeToMarket: '3-4 weeks',
    potentialRevenue: '$40K-120K MRR',
    status: 'idea',
    reasoning: 'TeamsActionLoop validated this need. Package as standalone SaaS. $20-50/user/month.'
  },
  {
    id: '7',
    title: 'Prompt Template Marketplace',
    description: 'Sell premium prompt templates for specific industries. Legal, medical, real estate, etc.',
    category: 'content',
    margin: 'high',
    effort: 'low',
    timeToMarket: '1 week',
    potentialRevenue: '$5K-20K MRR',
    status: 'idea',
    reasoning: 'Pure digital product. Create once, sell forever. Bundle with consulting upsell.'
  },
  {
    id: '8',
    title: 'AI Tuned Enterprise',
    description: 'On-prem AI assistant deployment for companies that can\'t use cloud. High-touch, high-ticket.',
    category: 'service',
    margin: 'high',
    effort: 'high',
    timeToMarket: '6-8 weeks',
    potentialRevenue: '$200K+ ARR per client',
    status: 'idea',
    reasoning: 'Banks, healthcare, gov need local AI. $50K-200K per deployment + monthly support.'
  }
]

export function JackbotIdeas() {
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null)
  const [filter, setFilter] = useState<'all' | 'high-margin' | 'quick-win'>('all')

  const filteredIdeas = jackbotIdeas.filter(idea => {
    if (filter === 'high-margin') return idea.margin === 'high' && idea.potentialRevenue.includes('100K')
    if (filter === 'quick-win') return idea.effort === 'low' || idea.timeToMarket.includes('1')
    return true
  })

  const getMarginColor = (margin: string) => {
    switch (margin) {
      case 'high': return 'text-green-400 bg-green-400/10'
      case 'medium': return 'text-yellow-400 bg-yellow-400/10'
      case 'low': return 'text-red-400 bg-red-400/10'
      default: return 'text-slate-400 bg-slate-400/10'
    }
  }

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'low': return 'text-green-400'
      case 'medium': return 'text-yellow-400'
      case 'high': return 'text-red-400'
      default: return 'text-slate-400'
    }
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            🧠 Jackbot's Ideas Lab
          </h2>
          <p className="text-xs text-slate-400 mt-1">High-margin opportunities I want to build</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded text-xs ${filter === 'all' ? 'bg-amber-500 text-black' : 'bg-slate-800 text-slate-400'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('high-margin')}
            className={`px-3 py-1 rounded text-xs ${filter === 'high-margin' ? 'bg-green-500 text-black' : 'bg-slate-800 text-slate-400'}`}
          >
            $100K+ MRR
          </button>
          <button
            onClick={() => setFilter('quick-win')}
            className={`px-3 py-1 rounded text-xs ${filter === 'quick-win' ? 'bg-blue-500 text-black' : 'bg-slate-800 text-slate-400'}`}
          >
            Quick Wins
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
        {filteredIdeas.map(idea => (
          <div
            key={idea.id}
            onClick={() => setSelectedIdea(selectedIdea?.id === idea.id ? null : idea)}
            className={`p-3 rounded-lg cursor-pointer transition-all ${
              selectedIdea?.id === idea.id 
                ? 'bg-amber-500/20 border border-amber-500/50' 
                : 'bg-slate-800/50 hover:bg-slate-800 border border-transparent'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-medium text-white text-sm">{idea.title}</h3>
              <span className={`px-2 py-0.5 rounded text-xs ${getMarginColor(idea.margin)}`}>
                {idea.margin} margin
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-2 line-clamp-2">{idea.description}</p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-amber-400 font-medium">{idea.potentialRevenue}</span>
              <span className={getEffortColor(idea.effort)}>{idea.timeToMarket}</span>
            </div>
            
            {selectedIdea?.id === idea.id && (
              <div className="mt-3 pt-3 border-t border-slate-700">
                <p className="text-xs text-slate-300 mb-2">
                  <strong className="text-amber-400">Why this works:</strong> {idea.reasoning}
                </p>
                <div className="flex gap-2 mt-2">
                  <button className="px-3 py-1 bg-green-500/20 text-green-400 rounded text-xs hover:bg-green-500/30">
                    ✅ Approve
                  </button>
                  <button className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded text-xs hover:bg-blue-500/30">
                    🔍 Research
                  </button>
                  <button className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded text-xs hover:bg-amber-500/30">
                    🚀 Build Now
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
        <div className="text-xs text-slate-400">
          <span className="text-white font-medium">{jackbotIdeas.length}</span> ideas • 
          <span className="text-green-400 ml-1">{jackbotIdeas.filter(i => i.margin === 'high').length} high-margin</span>
        </div>
        <div className="text-xs text-slate-500">
          Updated by Jackbot • Always thinking 🧠
        </div>
      </div>
    </Card>
  )
}
