'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

interface DashboardShellProps {
  title: string
  description: string
  children: ReactNode
  actions?: ReactNode
}

const navigationItems = [
  { href: '/', label: 'Overview', icon: '🏠' },
  { href: '/agents', label: 'Agent Bench', icon: '🤖' },
  { href: '/projects', label: 'Projects', icon: '📋' },
  { href: '/finance', label: 'Finance', icon: '💰' },
  { href: '/infrastructure', label: 'Infrastructure', icon: '🖥️' },
  { href: '/content-pipeline', label: 'Content Pipeline', icon: '📝' },
  { href: '/lessoncraft', label: 'LessonCraft', icon: '📱' },
]

function navItemClass(isActive: boolean): string {
  return isActive
    ? 'border-[#d4a853] bg-[#d4a853]/15 text-white shadow-[0_10px_30px_rgba(212,168,83,0.12)]'
    : 'border-transparent text-[#9ca3af] hover:border-[#2a2d37] hover:bg-white/5 hover:text-white'
}

export default function DashboardShell({
  title,
  description,
  children,
  actions,
}: DashboardShellProps) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-[#0f1117] text-white">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col md:flex-row">
        <aside className="hidden w-72 shrink-0 border-r border-[#2a2d37] bg-[#131722] md:flex md:flex-col">
          <div className="border-b border-[#2a2d37] px-6 py-6">
            <p className="text-xs uppercase tracking-[0.3em] text-[#d4a853]">Razor Command Center</p>
            <h1 className="mt-3 text-2xl font-semibold">Executive Ops</h1>
            <p className="mt-2 text-sm text-[#9ca3af]">Single-pane command view for agents, systems, and delivery.</p>
          </div>

          <nav className="flex-1 space-y-2 px-4 py-6">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition ${navItemClass(isActive)}`}
                >
                  <span aria-hidden="true">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          <form action="/api/auth/logout" method="post" className="border-t border-[#2a2d37] p-4">
            <button
              type="submit"
              className="w-full rounded-2xl border border-[#2a2d37] bg-white/5 px-4 py-3 text-sm font-medium text-[#9ca3af] transition hover:border-[#d4a853]/40 hover:bg-[#d4a853]/10 hover:text-white"
            >
              Sign Out
            </button>
          </form>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <div className="border-b border-[#2a2d37] px-4 py-4 md:hidden">
            <div className="mb-4">
              <p className="text-xs uppercase tracking-[0.3em] text-[#d4a853]">Razor Command Center</p>
              <p className="mt-2 text-sm text-[#9ca3af]">Executive operations dashboard</p>
            </div>

            <nav className="flex gap-2 overflow-x-auto pb-1">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition ${navItemClass(isActive)}`}
                  >
                    {item.icon} {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>

          <header className="border-b border-[#2a2d37] bg-[#0f1117]/90 px-4 py-5 backdrop-blur md:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-[#d4a853]">Razor Command Center</p>
                <h2 className="mt-2 text-2xl font-semibold md:text-3xl">{title}</h2>
                <p className="mt-2 max-w-3xl text-sm text-[#9ca3af] md:text-base">{description}</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-2xl border border-[#2a2d37] bg-[#1a1d27] px-4 py-3 text-sm text-[#9ca3af]">
                  <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(74,222,128,0.8)]" />
                  Live command surface
                </div>
                {actions}
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
        </div>
      </div>
    </div>
  )
}
