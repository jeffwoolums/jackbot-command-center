import DashboardShell from '@/components/layout/DashboardShell'
import SectionPlaceholder from '@/components/dashboard/SectionPlaceholder'

export default function AgentsPage() {
  return (
    <DashboardShell
      title="Agent Bench"
      description="Operator space for active and standby agents. Phase 1 establishes the route and navigation surface."
    >
      <SectionPlaceholder
        eyebrow="Agent Bench"
        title="Bench controls are staged for live agent orchestration."
        description="This section is ready for the richer Phase 2 bench: active sessions, spawn controls, logs, and steering actions."
      />
    </DashboardShell>
  )
}
