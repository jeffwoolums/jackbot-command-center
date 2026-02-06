'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'

interface RevenueMetric {
  id: string
  name: string
  value: number
  change: number
  target: number
  period: 'daily' | 'monthly' | 'yearly'
}

interface Subscription {
  id: string
  name: string
  status: 'active' | 'pending' | 'cancelled'
  amount: number
  interval: 'monthly' | 'yearly'
  nextBilling: string
  users: number
}

export function RevenueDashboard() {
  const [metrics, setMetrics] = useState<RevenueMetric[]>([
    {
      id: 'mrr',
      name: 'Monthly Recurring Revenue',
      value: 0,
      change: 0,
      target: 1000,
      period: 'monthly'
    },
    {
      id: 'arr',
      name: 'Annual Recurring Revenue',
      value: 0,
      change: 0,
      target: 12000,
      period: 'yearly'
    },
    {
      id: 'customers',
      name: 'Active Customers',
      value: 0,
      change: 0,
      target: 10,
      period: 'monthly'
    },
    {
      id: 'churn',
      name: 'Churn Rate',
      value: 0,
      change: 0,
      target: 5,
      period: 'monthly'
    }
  ])

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([
    {
      id: 'stripe',
      name: 'Stripe Integration',
      status: 'pending',
      amount: 0,
      interval: 'monthly',
      nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      users: 0
    },
    {
      id: 'github',
      name: 'GitHub Copilot',
      status: 'active',
      amount: 19,
      interval: 'monthly',
      nextBilling: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      users: 1
    },
    {
      id: 'openai',
      name: 'OpenAI API',
      status: 'active',
      amount: 120,
      interval: 'monthly',
      nextBilling: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      users: 1
    },
    {
      id: 'anthropic',
      name: 'Anthropic Claude',
      status: 'active',
      amount: 20,
      interval: 'monthly',
      nextBilling: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
      users: 1
    }
  ])

  const [selectedMetric, setSelectedMetric] = useState('mrr')

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays < 7) return `In ${diffDays} days`
    if (diffDays < 30) return `In ${Math.floor(diffDays / 7)} weeks`
    return `In ${Math.floor(diffDays / 30)} months`
  }

  const getProgressPercentage = (value: number, target: number) => {
    return Math.min(100, (value / target) * 100)
  }

  const connectStripe = () => {
    alert('Stripe integration would be connected here.\n\nIn production, this would redirect to Stripe OAuth.')
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Revenue Dashboard</h2>
        <span className="text-xs text-amber-400">Stripe Pending</span>
      </div>
      
      {/* Revenue Metrics */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-slate-400 mb-3">Key Metrics</h3>
        <div className="grid grid-cols-2 gap-3">
          {metrics.map(metric => (
            <div 
              key={metric.id}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                selectedMetric === metric.id
                  ? 'bg-slate-800/50 border border-slate-700'
                  : 'bg-slate-800/30 hover:bg-slate-800/50'
              }`}
              onClick={() => setSelectedMetric(metric.id)}
            >
              <div className="text-xs text-slate-400 mb-1">{metric.name}</div>
              <div className="text-xl font-bold text-white mb-2">
                {metric.id.includes('rate') ? `${metric.value}%` : formatCurrency(metric.value)}
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Progress</span>
                  <span className="text-white">
                    {getProgressPercentage(metric.value, metric.target).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full ${
                      getProgressPercentage(metric.value, metric.target) >= 100 ? 'bg-green-500' :
                      getProgressPercentage(metric.value, metric.target) >= 50 ? 'bg-amber-500' :
                      'bg-blue-500'
                    }`}
                    style={{ width: `${getProgressPercentage(metric.value, metric.target)}%` }}
                  />
                </div>
                <div className="text-xs text-slate-400">
                  Target: {metric.id.includes('rate') ? `${metric.target}%` : formatCurrency(metric.target)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Subscriptions */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-slate-400">Subscriptions</h3>
          <button
            onClick={connectStripe}
            className="px-3 py-1 text-xs bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-colors"
          >
            Connect Stripe
          </button>
        </div>
        
        <div className="space-y-2">
          {subscriptions.map(sub => (
            <div 
              key={sub.id}
              className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  sub.status === 'active' ? 'bg-green-500' :
                  sub.status === 'pending' ? 'bg-yellow-500' :
                  'bg-red-500'
                }`} />
                <div>
                  <div className="font-medium text-white">{sub.name}</div>
                  <div className="text-xs text-slate-400">
                    {sub.interval} • {sub.users} user{sub.users !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-medium text-white">
                  {sub.amount > 0 ? formatCurrency(sub.amount) : '—'}
                </div>
                <div className="text-xs text-slate-400">
                  {sub.status === 'pending' ? 'Setup required' : `Next: ${formatDate(sub.nextBilling)}`}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Stripe Integration Placeholder */}
      <div className="p-4 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-lg border border-purple-500/30">
        <div className="flex items-center justify-between mb-2">
          <div className="text-white font-medium">Stripe Integration</div>
          <div className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded">Pending</div>
        </div>
        <p className="text-sm text-slate-300 mb-3">
          Connect Stripe to start processing payments, track revenue, and manage subscriptions.
        </p>
        <div className="flex gap-2">
          <button
            onClick={connectStripe}
            className="flex-1 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-colors text-sm"
          >
            Connect Stripe
          </button>
          <button
            onClick={() => alert('View documentation')}
            className="px-4 py-2 bg-slate-800/50 text-slate-300 rounded-lg hover:bg-slate-800 transition-colors text-sm"
          >
            Docs
          </button>
        </div>
      </div>
      
      {/* Stats */}
      <div className="mt-4 pt-4 border-t border-slate-800">
        <div className="flex items-center justify-between text-sm">
          <div>
            <span className="text-slate-400">Total MRR: </span>
            <span className="text-white">
              {formatCurrency(subscriptions.reduce((sum, sub) => sum + (sub.status === 'active' ? sub.amount : 0), 0))}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div>
              <span className="text-slate-400">Active: </span>
              <span className="text-green-400">
                {subscriptions.filter(s => s.status === 'active').length}
              </span>
            </div>
            <div>
              <span className="text-slate-400">Pending: </span>
              <span className="text-yellow-400">
                {subscriptions.filter(s => s.status === 'pending').length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}