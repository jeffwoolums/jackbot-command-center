import OverviewDashboard from '@/components/dashboard/OverviewDashboard'
import DashboardShell from '@/components/layout/DashboardShell'

export default function HomePage() {
  return (
    <DashboardShell
      title="Executive Overview"
      description="High-level visibility into agents, workload, API spend, and infrastructure. This replaces the old landing page with a Phase 1 command view."
    >
      <OverviewDashboard />
    </DashboardShell>
  )
}
