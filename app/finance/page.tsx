import DashboardShell from '@/components/layout/DashboardShell'
import SectionPlaceholder from '@/components/dashboard/SectionPlaceholder'

export default function FinancePage() {
  return (
    <DashboardShell
      title="Finance"
      description="Financial visibility and API spend live here. Phase 1 establishes the route within the Razor shell."
    >
      <SectionPlaceholder
        eyebrow="Finance"
        title="Finance dashboards are queued for live metrics."
        description="This module is reserved for API spend, revenue, and manual finance entries once the backing data sources are wired."
      />
    </DashboardShell>
  )
}
