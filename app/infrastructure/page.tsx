import DashboardShell from '@/components/layout/DashboardShell'
import InfrastructureMonitor from '@/components/dashboard/InfrastructureMonitor'

export default function InfrastructurePage() {
  return (
    <DashboardShell
      title="Infrastructure Monitor"
      description="Static telemetry for the current fleet. The page is structured to swap into live SSH-backed checks in the next phase."
    >
      <InfrastructureMonitor />
    </DashboardShell>
  )
}
