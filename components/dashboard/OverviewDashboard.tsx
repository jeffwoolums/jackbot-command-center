'use client'

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const statusCards = [
  { label: 'Active Agents', value: '4', note: '2 building, 2 ready' },
  { label: 'Tasks Today', value: '18', note: '6 completed this hour' },
  { label: 'API Cost Today', value: '$12.45', note: '3.2% under target' },
  { label: 'Servers Online', value: '3/3', note: 'Tailscale healthy' },
]

const activityFeed = [
  { id: 'act-1', title: 'Codex shipped the latest agent bench refinement', time: '5 min ago', type: 'agent' },
  { id: 'act-2', title: 'RaceStream backup completed successfully', time: '18 min ago', type: 'infrastructure' },
  { id: 'act-3', title: 'LessonCraft asset sync queued for approval', time: '42 min ago', type: 'content' },
  { id: 'act-4', title: 'Finance snapshot recorded for Sunday closeout', time: '1 hr ago', type: 'finance' },
]

const costTrend = [
  { hour: '09:00', cost: 1.2 },
  { hour: '11:00', cost: 2.4 },
  { hour: '13:00', cost: 4.8 },
  { hour: '15:00', cost: 7.1 },
  { hour: '17:00', cost: 9.6 },
  { hour: '19:00', cost: 12.45 },
]

const quickActions = [
  { title: 'New Task', description: 'Open a fresh work item in the project queue.' },
  { title: 'Spawn Agent', description: 'Dispatch a new operator to an active objective.' },
  { title: 'Check Servers', description: 'Review health telemetry across the infrastructure fleet.' },
]

export default function OverviewDashboard() {
  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statusCards.map((card) => (
          <article
            key={card.label}
            className="rounded-3xl border border-[#2a2d37] bg-[#1a1d27] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.22)]"
          >
            <p className="text-sm text-[#9ca3af]">{card.label}</p>
            <p className="mt-3 text-3xl font-semibold text-white">{card.value}</p>
            <p className="mt-2 text-sm text-[#9ca3af]">{card.note}</p>
          </article>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-3xl border border-[#2a2d37] bg-[#1a1d27] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.22)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold">API Cost Trend</h3>
              <p className="mt-1 text-sm text-[#9ca3af]">Recharts placeholder wired for live finance telemetry later.</p>
            </div>
            <div className="rounded-full border border-[#d4a853]/30 bg-[#d4a853]/10 px-3 py-1 text-xs font-medium text-[#f4d79a]">
              Today
            </div>
          </div>

          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={costTrend}>
                <defs>
                  <linearGradient id="costFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d4a853" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#d4a853" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#2a2d37" vertical={false} />
                <XAxis dataKey="hour" stroke="#9ca3af" tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#11141d', border: '1px solid #2a2d37', borderRadius: '16px', color: '#fff' }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'API Cost']}
                />
                <Area type="monotone" dataKey="cost" stroke="#d4a853" strokeWidth={3} fill="url(#costFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        <div className="grid grid-cols-1 gap-6">
          <article className="rounded-3xl border border-[#2a2d37] bg-[#1a1d27] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.22)]">
            <h3 className="text-lg font-semibold">Recent Activity</h3>
            <p className="mt-1 text-sm text-[#9ca3af]">Static structure for the future event stream.</p>
            <div className="mt-5 space-y-4">
              {activityFeed.map((item) => (
                <div key={item.id} className="flex items-start gap-3 rounded-2xl border border-white/5 bg-black/10 p-4">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[#d4a853]" />
                  <div>
                    <p className="text-sm text-white">{item.title}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.25em] text-[#9ca3af]">
                      {item.type} • {item.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-3xl border border-[#2a2d37] bg-[#1a1d27] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.22)]">
            <h3 className="text-lg font-semibold">Quick Actions</h3>
            <div className="mt-5 space-y-3">
              {quickActions.map((action) => (
                <button
                  key={action.title}
                  type="button"
                  className="w-full rounded-2xl border border-[#2a2d37] bg-[#11141d] px-4 py-4 text-left transition hover:border-[#d4a853]/40 hover:bg-[#d4a853]/10"
                >
                  <p className="font-medium text-white">{action.title}</p>
                  <p className="mt-1 text-sm text-[#9ca3af]">{action.description}</p>
                </button>
              ))}
            </div>
          </article>
        </div>
      </section>
    </div>
  )
}
